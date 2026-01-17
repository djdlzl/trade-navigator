import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KoreaInvestmentToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface HoldingData {
  stock_code: string;
  stock_name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  profit_rate: number;
  account_name: string;
}

// 한국투자증권 API 토큰 발급
async function getKoreaInvestmentToken(appKey: string, appSecret: string, isProd: boolean = false): Promise<string> {
  const baseUrl = isProd 
    ? "https://openapi.koreainvestment.com:9443" 
    : "https://openapivts.koreainvestment.com:29443";
  
  const response = await fetch(`${baseUrl}/oauth2/tokenP`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: appKey,
      appsecret: appSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token request failed:", errorText);
    throw new Error(`토큰 발급 실패: ${response.status}`);
  }

  const data: KoreaInvestmentToken = await response.json();
  return data.access_token;
}

// 한국투자증권 잔고 조회
async function fetchKoreaInvestmentHoldings(
  appKey: string, 
  appSecret: string, 
  accountNumber: string,
  isProd: boolean = false
): Promise<HoldingData[]> {
  const baseUrl = isProd 
    ? "https://openapi.koreainvestment.com:9443" 
    : "https://openapivts.koreainvestment.com:29443";
  
  const accessToken = await getKoreaInvestmentToken(appKey, appSecret, isProd);
  
  // 계좌번호 파싱 (XXXXXXXX-XX 형식)
  const [cano, acntPrdtCd] = accountNumber.split("-");
  
  if (!cano || !acntPrdtCd) {
    throw new Error("계좌번호 형식이 올바르지 않습니다. (XXXXXXXX-XX)");
  }

  const trId = isProd ? "TTTC8434R" : "VTTC8434R"; // 실전/모의투자 구분
  
  const queryParams = new URLSearchParams({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    AFHR_FLPR_YN: "N",
    OFL_YN: "",
    INQR_DVSN: "02",
    UNPR_DVSN: "01",
    FUND_STTL_ICLD_YN: "N",
    FNCG_AMT_AUTO_RDPT_YN: "N",
    PRCS_DVSN: "01",
    CTX_AREA_FK100: "",
    CTX_AREA_NK100: "",
  });

  const response = await fetch(`${baseUrl}/uapi/domestic-stock/v1/trading/inquire-balance?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "authorization": `Bearer ${accessToken}`,
      "appkey": appKey,
      "appsecret": appSecret,
      "tr_id": trId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Holdings request failed:", errorText);
    throw new Error(`잔고 조회 실패: ${response.status}`);
  }

  const data = await response.json();
  console.log("Holdings response:", JSON.stringify(data, null, 2));

  if (data.rt_cd !== "0") {
    throw new Error(`API 오류: ${data.msg1}`);
  }

  const holdings: HoldingData[] = (data.output1 || [])
    .filter((item: any) => parseInt(item.hldg_qty) > 0)
    .map((item: any) => ({
      stock_code: item.pdno,
      stock_name: item.prdt_name,
      quantity: parseInt(item.hldg_qty),
      avg_price: parseFloat(item.pchs_avg_pric),
      current_price: parseFloat(item.prpr),
      profit_rate: parseFloat(item.evlu_pfls_rt),
      account_name: `한국투자증권 ${acntPrdtCd}`,
    }));

  return holdings;
}

// 키움증권 API 잔고 조회 (실제 구현 시 사용)
async function fetchKiwoomHoldings(
  appKey: string, 
  appSecret: string, 
  accountNumber: string
): Promise<HoldingData[]> {
  // 키움증권 OpenAPI+ 연동 로직
  // 실제 구현 시 HTS ID/PW 또는 공인인증서 기반 인증 필요
  console.log("Kiwoom API not fully implemented yet");
  throw new Error("키움증권 API 연동은 현재 준비 중입니다.");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "인증이 필요합니다" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing holdings for user: ${user.id}`);

    // Get user settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !settings) {
      console.error("Settings error:", settingsError);
      return new Response(
        JSON.stringify({ error: "증권사 설정이 없습니다. 전략 관리에서 설정해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { brokerage_type, api_key_encrypted, api_secret_encrypted, account_number } = settings;

    if (!api_key_encrypted || !api_secret_encrypted || !account_number) {
      return new Response(
        JSON.stringify({ error: "증권사 API 정보가 설정되지 않았습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let holdings: HoldingData[] = [];

    // Fetch holdings based on brokerage type
    switch (brokerage_type) {
      case "korea_investment":
        holdings = await fetchKoreaInvestmentHoldings(
          api_key_encrypted,
          api_secret_encrypted,
          account_number,
          false // Use sandbox by default, set to true for production
        );
        break;
      case "kiwoom":
        holdings = await fetchKiwoomHoldings(api_key_encrypted, api_secret_encrypted, account_number);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `지원하지 않는 증권사입니다: ${brokerage_type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Fetched ${holdings.length} holdings`);

    // Calculate weight
    const totalValue = holdings.reduce((acc, h) => acc + h.current_price * h.quantity, 0);
    const holdingsWithWeight = holdings.map(h => ({
      ...h,
      weight: totalValue > 0 ? ((h.current_price * h.quantity) / totalValue) * 100 : 0,
    }));

    // Delete existing holdings for this user
    const { error: deleteError } = await supabaseClient
      .from("holdings")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      throw new Error("기존 잔고 삭제 실패");
    }

    // Insert new holdings
    if (holdingsWithWeight.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("holdings")
        .insert(
          holdingsWithWeight.map(h => ({
            user_id: user.id,
            stock_code: h.stock_code,
            stock_name: h.stock_name,
            quantity: h.quantity,
            avg_price: h.avg_price,
            current_price: h.current_price,
            profit_rate: h.profit_rate,
            weight: h.weight,
            account_name: h.account_name,
          }))
        );

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("잔고 저장 실패");
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${holdings.length}개 종목 동기화 완료`,
        count: holdings.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "동기화 실패";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
