(() => {
  "use strict";
  const data = window.APP_DATA;
  const colors = ["#b18a43", "#2f766f", "#607c8a", "#93685b", "#7b7857"];
  let activeClient = data.clients[0].client_id;
  let activeView = "clients";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const ko = {
    "Self-employed":"자영업", "Salaried professional":"직장인", "Retired":"은퇴자", "Licensed professional":"전문직", "Corporate owner":"법인대표",
    "Retirement preparation":"은퇴 준비", "Long-term wealth building":"장기 자산형성", "Retirement income":"은퇴 후 현금흐름", "Education and asset growth":"교육자금·자산성장", "Liquidity and diversification":"유동성·분산",
    "KRW 500M–1B (synthetic band)":"5억~10억원 미만(가상 구간)", "KRW 100M–300M (synthetic band)":"1억~3억원 미만(가상 구간)", "KRW 300M–500M (synthetic band)":"3억~5억원 미만(가상 구간)", "KRW 1B–3B (synthetic band)":"10억~30억원 미만(가상 구간)",
    "Balanced":"균형형", "Growth-oriented":"성장 지향", "Stability-oriented":"안정 지향", "Balanced growth":"균형 성장형",
    "Medium":"중간", "Low":"낮음", "High":"높음", "5–10 years":"5~10년", "10+ years":"10년 이상", "3–7 years":"3~7년", "7–12 years":"7~12년",
    "Retirement readiness":"은퇴 준비", "Business-to-personal liquidity bridge":"사업자금과 개인자금의 유동성 관리", "Long-term asset formation":"장기 자산형성", "Maintain disciplined contributions":"정기 적립 지속", "Cash-flow visibility":"현금흐름 가시성", "Planned withdrawals":"예정 인출 관리", "Education funding":"교육자금 마련", "Long-term asset growth":"장기 자산성장", "Maintain liquidity":"유동성 유지", "Understand concentration and diversification":"자산 집중과 분산 이해",
    "Irregular business cash flow":"불규칙한 사업 현금흐름", "Confirm near-term cash needs before discussion":"상담 전 단기 현금수요 확인", "No short-term performance assumptions":"단기 성과를 전제하지 않음", "Confirm job-related income stability":"근로소득의 안정성 확인", "Regular withdrawal need":"정기 인출 필요", "Explain data dates and units clearly":"데이터 기준일과 단위를 명확히 설명", "Education payment schedule":"교육비 지급 일정", "Separate goal dates from market narratives":"목표 시점과 시장 해석을 분리", "Business-linked liquidity events":"사업 연계 유동성 일정", "Do not infer personal and corporate assets are interchangeable":"개인·법인 자산을 동일하게 보지 않음",
    "Cash & CMA":"현금·CMA", "Bonds":"채권", "Korean Equity":"국내주식", "Global Equity":"해외주식", "Alternatives":"대체자산",
    "rates":"금리", "inflation":"물가", "cashflow":"현금흐름", "liquidity":"유동성", "market_funds":"시장 주변 자금", "long_term_growth":"장기 성장", "fx":"환율", "policy":"정책", "capital_action":"기업 자본 이벤트", "sector:energy":"에너지 산업", "sector:semiconductor":"반도체 산업", "sector:software":"소프트웨어 산업", "sector:bank":"은행 산업", "sector:biotech":"바이오 산업",
    "retirement income":"은퇴 후 현금흐름", "long-term contributions":"장기 적립", "technology sector":"기술 산업", "cash-flow schedule":"현금흐름 일정", "foreign-currency exposure":"외화 노출", "education schedule":"교육비 일정", "global assets":"글로벌 자산", "liquidity reserve":"유동성 여유자금", "corporate events":"기업 이벤트",
    "Rates":"금리", "Inflation":"물가", "FX":"환율", "Liquidity":"유동성", "Cash-flow schedule":"현금흐름 일정", "Policy context":"정책 맥락", "Corporate event context":"기업 이벤트 맥락", "Education timeline":"교육비 일정",
    "Confirm goal date":"목표 시점 확인", "Confirm cash-use date":"자금 사용 시점 확인", "Verify source date":"출처 기준일 확인", "Review official source":"공식 원문 확인", "Prepare concept explanation":"금융 개념 설명 준비",
    "Review planned cash-flow dates":"예정 현금흐름 일정 확인", "Prepare source-date summary":"출처·기준일 요약 준비", "Confirm next meeting agenda":"다음 상담 안건 확인", "Confirm long-term goal dates":"장기 목표 시점 확인", "Review planned withdrawals":"예정 인출 일정 확인", "Confirm education funding timeline":"교육자금 일정 확인", "Review liquidity event calendar":"유동성 일정 확인",
    "Planned":"예정", "Open":"진행 중", "Completed":"완료"
  };
  const ui = value => ko[value] || value;
  const reasonText = value => {
    const parts = value.split(":");
    if (parts.length < 2) return value;
    return `${parts[0]}: ${parts.slice(1).join(":").split(",").map(v => ui(v.trim())).join(", ")}`;
  };
  const sourceName = value => ({ecos:"한국은행 ECOS",cma:"CMA 통계",credit:"신용융자 통계",market_funds:"투자자예탁금 통계",fund_assets:"펀드 순자산 통계",bok_statistics:"한국은행 통계",bok_policy:"한국은행 정책자료",fsc_policy:"금융위원회 정책자료",dart:"전자공시"}[value] || value);
  const categoryName = value => ({snapshot:"시장 데이터",policy:"정책·경제지표",disclosure:"기업 공시"}[value] || value);
  const fmtDate = value => value ? value.slice(0, 10).replaceAll("-", ".") : "미제공";
  const fmtChecked = value => value ? value.replace("T", " ").slice(0, 16) + " KST" : "미제공";
  const client = () => data.clients.find(item => item.client_id === activeClient);
  const viewData = () => data.client_views[activeClient];

  function initSelector() {
    const select = $("#global-client");
    select.innerHTML = data.clients.map(c => `<option value="${esc(c.client_id)}">${esc(c.client_id)}</option>`).join("");
    select.addEventListener("change", () => { activeClient = select.value; renderAll(); });
  }

  function navigate(name) {
    activeView = name;
    $$(".nav-button").forEach(b => b.classList.toggle("is-active", b.dataset.view === name));
    $$(".view").forEach(v => v.classList.toggle("is-active", v.id === `view-${name}`));
    const titles = {clients: "PB 고객 인텔리전스", profile: "고객 프로필", brief: "상담 준비 브리프", followup: "후속 관리"};
    $("#page-title").textContent = titles[name];
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  function renderClients(filter = "all") {
    const list = data.clients.filter(c => filter === "all" || c.liquidity_need === filter || c.life_stage.includes(filter));
    $("#client-grid").innerHTML = list.map(c => `
      <article class="client-card ${c.client_id === activeClient ? "is-selected" : ""}">
        <span class="client-code">${esc(c.client_id)}</span>
        <h3>${esc(ui(c.occupation_category))} · ${esc(ui(c.life_stage))}</h3>
        <p class="client-goal"><span>핵심 목표</span>${esc(ui(c.financial_goals[0]))}</p>
        <div class="mini-stats">
          <div class="mini-stat"><span>연령대</span><strong>${esc(c.age_band.replace("s", "대"))}</strong></div>
          <div class="mini-stat"><span>유동성 필요</span><strong>${esc(ui(c.liquidity_need))}</strong></div>
          <div class="mini-stat"><span>투자기간</span><strong>${esc(ui(c.investment_horizon))}</strong></div>
        </div>
        <button class="open-client" data-client="${esc(c.client_id)}">프로필 보기 →</button>
      </article>`).join("");
    $$(".open-client").forEach(button => button.addEventListener("click", () => {
      activeClient = button.dataset.client; $("#global-client").value = activeClient; renderAll(); navigate("profile");
    }));
  }

  function donut(allocation) {
    const radius = 67, circumference = 2 * Math.PI * radius;
    let offset = 0;
    const circles = Object.entries(allocation).map(([name, pct], i) => {
      const length = circumference * pct / 100;
      const circle = `<circle cx="90" cy="90" r="${radius}" fill="none" stroke="${colors[i]}" stroke-width="18" stroke-dasharray="${length} ${circumference-length}" stroke-dashoffset="${-offset}"/>`;
      offset += length; return circle;
    }).join("");
    return `<div class="donut-wrap"><svg viewBox="0 0 180 180" role="img" aria-label="가상 현재 자산 구성"><circle cx="90" cy="90" r="67" fill="none" stroke="#e7e2d7" stroke-width="18"/>${circles}</svg><div class="donut-center"><strong>100%</strong><span>가상 현재<br>자산 구성</span></div></div>`;
  }

  function renderProfile() {
    const c = client();
    const legend = Object.entries(c.portfolio_allocation).map(([name, pct], i) => `<div class="legend-row"><i class="legend-swatch" style="background:${colors[i]}"></i><span>${esc(ui(name))}</span><strong>${pct}%</strong></div>`).join("");
    $("#profile-content").innerHTML = `
      <div class="profile-hero"><div><span class="section-kicker">가상 고객 프로필</span><h2 id="profile-heading">${esc(c.client_id)}</h2><p>${esc(ui(c.occupation_category))} · ${esc(ui(c.life_stage))}</p></div>
        <div class="profile-meta"><div><span>연령대</span><strong>${esc(c.age_band.replace("s", "대"))}</strong></div><div><span>가상 금융자산 구간</span><strong>${esc(ui(c.investable_asset_band))}</strong></div><div><span>투자기간</span><strong>${esc(ui(c.investment_horizon))}</strong></div><div><span>가상 고객 사전 설정 성향</span><strong>${esc(ui(c.stated_risk_preference))}</strong></div></div>
      </div>
      <div class="profile-grid">
        <section class="panel"><span class="section-kicker">고객 맥락</span><h3>재무 목표</h3><ul class="goal-list">${c.financial_goals.map(v=>`<li>${esc(ui(v))}</li>`).join("")}</ul><h3>관심 주제</h3><div class="tag-list">${c.interests.map(v=>`<span class="tag">${esc(ui(v))}</span>`).join("")}</div><h3>상담 전 확인할 제약</h3><ul class="constraint-list">${c.constraints.map(v=>`<li>${esc(ui(v))}</li>`).join("")}</ul></section>
        <section class="panel"><span class="section-kicker">자산 구성</span><h3>현재 가상 자산 구성</h3><div class="allocation-layout">${donut(c.portfolio_allocation)}<div class="allocation-legend">${legend}</div></div><div class="guardrail" style="margin-top:22px">현재 가상 구성을 관찰하는 화면입니다. 목표 비중이나 비중 변경안을 제시하지 않습니다.</div></section>
        <section class="story-panel"><span class="section-kicker">상담 준비 관점</span><h3>자산 구성 이야기</h3><p>${esc(c.portfolio_story)}</p></section>
      </div>`;
  }

  function dateMetadata(item) {
    const parts = [];
    if (item.published_as_of) parts.push(`<span class="date-pill">발행 기준일 · ${fmtDate(item.published_as_of)}</span>`);
    if (item.data_as_of) parts.push(`<span class="date-pill">데이터 기준일 · ${fmtDate(item.data_as_of)}</span>`);
    if (item.source_checked_at) parts.push(`<span class="date-pill">출처 확인 시각 · ${fmtChecked(item.source_checked_at)}</span>`);
    return parts.join("");
  }

  function renderBrief() {
    const c = client(), v = viewData(), market = data.market_snapshot, research = data.research_snapshot;
    const asOf = market.latest_available_source_date ? `관련 시장 이슈 · ${fmtDate(market.latest_available_source_date)} 기준` : "관련 시장 이슈 · 기준일 미확인";
    const issues = v.relevant_issues.length ? v.relevant_issues.map((item, i) => `<details class="issue-card" ${i === 0 ? "open" : ""}><summary><div><span class="issue-source">${esc(sourceName(item.source))} · ${esc(categoryName(item.category))}</span><h4>${esc(item.title)}</h4></div></summary><div class="issue-body"><h5>무슨 일이 있었나</h5><p>${esc(item.summary)}</p><div class="date-row">${dateMetadata(item)}</div><div class="reason-box"><strong>이 고객에게 관련 있는 이유</strong><br>${item.match_reasons.map(v=>esc(reasonText(v))).join(" · ")}</div><div class="discussion-point"><strong>상담에서 확인할 포인트</strong><span>${esc(v.questions[0])}</span></div><a class="source-link" href="${esc(item.original_url)}" target="_blank" rel="noreferrer">공식 출처 확인 ↗</a></div></details>`).join("") : `<div class="empty-state">규칙에 일치하는 관련 시장 이슈가 없습니다.</div>`;
    const researchItems = v.research_context.length ? v.research_context.map(item => `<article class="research-item"><span class="data-label">리포트 발행일 · ${fmtDate(item.report_date)}</span><strong>${esc(item.report_title)}</strong><h5>리포트 핵심 요약</h5><p>${esc(item.safe_easy_explanation)}</p><a href="${esc(item.source_url)}" target="_blank" rel="noreferrer">출처 ↗</a></article>`).join("") : `<div class="empty-state">일치하는 산업 리서치 참고자료가 없습니다.</div>`;
    const sourceStatus = market.source_status === "COMPLETE" ? `최신 확인 가능 기준일 · ${fmtDate(market.latest_available_source_date)}` : "출처 상태: 일부 데이터 확인 제한";
    const builtAt = market.snapshot_created_at ? `${fmtDate(market.snapshot_created_at)} ${market.snapshot_created_at.slice(11,16)}` : "미확인";
    $("#brief-content").innerHTML = `
      <div class="brief-head"><div><span class="section-kicker">${esc(c.client_id)} · 상담 준비 브리프</span><h2 id="brief-heading">고객과 나눌 대화를 준비합니다.</h2><p>${esc(ui(c.life_stage))} · ${esc(ui(c.occupation_category))}</p></div><div class="as-of-box"><span>시장정보 기준</span><strong>${sourceStatus}</strong><span>출처 확인 시각 · ${fmtChecked(market.source_checked_at)}</span><span>브리프 생성 · ${builtAt}</span></div></div>
      <div class="brief-layout"><div class="brief-main">
        <div class="snapshot-strip"><div><span>유동성 필요</span><strong>${esc(ui(c.liquidity_need))}</strong></div><div><span>투자기간</span><strong>${esc(ui(c.investment_horizon))}</strong></div><div><span>가상 고객 사전 설정 성향</span><strong>${esc(ui(c.stated_risk_preference))}</strong></div></div>
        <section><span class="section-kicker">${asOf}</span><h3>고객 맥락과 연결된 시장정보</h3>${issues}</section>
        <section class="panel"><span class="section-kicker">상담 전 확인 질문</span><h3>대화를 여는 질문</h3><ol class="question-list">${v.questions.map(q=>`<li>${esc(q)}</li>`).join("")}</ol></section>
      </div><aside class="brief-side">
        <section class="panel"><span class="section-kicker">자산 구성 관찰</span><h3>현재 구성에서 보이는 점</h3><p>${esc(c.portfolio_story)}</p><div class="guardrail">설명 전에 기간·현금수요·목표 변화를 확인합니다. 비중 변경안은 만들지 않습니다.</div></section>
        <section class="panel"><span class="section-kicker">설명할 금융 개념</span><h3>쉽게 설명할 핵심 개념</h3><div class="concept-grid">${v.concepts.map(x=>`<article class="concept-card"><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p></article>`).join("")}</div></section>
        <section class="panel"><span class="section-kicker">리서치 참고자료 · ${fmtDate(research.latest_available_source_date)} 기준</span><h3>종목 제안이 아닌 상담 참고자료</h3>${researchItems}</section>
        <section class="panel"><span class="section-kicker">이전 상담 맥락</span><h3>이전에 함께 살펴본 주제</h3><div class="tag-list">${c.previous_meeting_topics.map(v=>`<span class="tag">${esc(ui(v))}</span>`).join("")}</div></section>
      </aside></div>`;
  }

  const seedFollowups = data.followup_seed;
  const storageKey = "pb-consult-prep-followups";
  const loadFollowups = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || structuredClone(seedFollowups); } catch { return structuredClone(seedFollowups); } };
  let followups = loadFollowups();

  function renderFollowupOptions() {
    $("#topic-options").innerHTML = data.followup_options.topics.map((v,i)=>`<label class="check-option"><input type="checkbox" name="topic" value="${esc(v)}" ${i===0?"checked":""}>${esc(ui(v))}</label>`).join("");
    $("#check-options").innerHTML = data.followup_options.checks.map((v,i)=>`<label class="check-option"><input type="checkbox" name="check" value="${esc(v)}" ${i===0?"checked":""}>${esc(ui(v))}</label>`).join("");
    $("#followup-task").innerHTML = data.followup_options.tasks.map(v=>`<option value="${esc(v)}">${esc(ui(v))}</option>`).join("");
    $("#followup-status").innerHTML = data.followup_options.statuses.map(v=>`<option value="${esc(v)}">${esc(ui(v))}</option>`).join("");
  }

  function renderFollowups() {
    $("#followup-client-label").textContent = activeClient;
    const items = followups[activeClient] || [];
    $("#followup-timeline").innerHTML = items.length ? items.map(item => `<article class="timeline-item"><header><h4>${fmtDate(item.followup_date)} · ${esc(ui(item.task))}</h4><span class="status">${esc(ui(item.status))}</span></header><p>상담일 · ${fmtDate(item.meeting_date)}</p><p>논의 주제 · ${item.topics.map(v=>esc(ui(v))).join(" · ")}</p><p>확인 항목 · ${item.checks.map(v=>esc(ui(v))).join(" · ")}</p></article>`).join("") : `<div class="empty-state">저장된 가상 후속 관리 항목이 없습니다.</div>`;
  }

  function renderAll() {
    renderClients($(".filter-button.is-active")?.dataset.filter || "all");
    renderProfile(); renderBrief(); renderFollowups();
  }

  $$(".nav-button").forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
  $$(".filter-button").forEach(button => button.addEventListener("click", () => {
    $$(".filter-button").forEach(b=>b.classList.remove("is-active")); button.classList.add("is-active"); renderClients(button.dataset.filter);
  }));
  $("#followup-form").addEventListener("submit", event => {
    event.preventDefault();
    const topics = $$('input[name="topic"]:checked').map(x=>x.value), checks = $$('input[name="check"]:checked').map(x=>x.value);
    if (!topics.length || !checks.length) { $("#form-note").textContent = "논의 주제와 확인 항목을 하나 이상 선택해 주세요."; return; }
    const item = {meeting_date:$("#meeting-date").value,topics,checks,followup_date:$("#followup-date").value,task:$("#followup-task").value,status:$("#followup-status").value};
    followups[activeClient] = [item, ...(followups[activeClient] || [])]; localStorage.setItem(storageKey, JSON.stringify(followups));
    $("#form-note").textContent = "가상 후속 관리 항목을 이 브라우저에 추가했습니다."; renderFollowups();
  });
  $("#reset-followups").addEventListener("click", () => { followups = structuredClone(seedFollowups); localStorage.removeItem(storageKey); renderFollowups(); });

  initSelector(); renderFollowupOptions(); renderAll(); navigate(activeView);
})();
