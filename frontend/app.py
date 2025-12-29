import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from datetime import datetime

st.set_page_config(page_title="토닥토닥 - 당신의 마음을 안아주는 AI", layout="wide", initial_sidebar_state="collapsed")

# Translation Dictionary
TRANSLATIONS = {
    "ko": {
        "title": "☁️ 토닥토닥",
        "subtitle": "내 마음의 쉼표, 당신을 위한 따뜻한 감정 케어 서비스",
        "tab_prescription": "📝 데일리 처방전",
        "tab_chat": "💬 AI 컴패니언",
        "tab_wearable": "⌚ 웨어러블 리포트",
        "input_header": "🖋️ 오늘 하루는 어떠셨나요?",
        "input_placeholder": "이곳에 당신의 감정을 들려주세요 (최소 5자 이상)",
        "btn_analyze": "내 마음 분석하기",
        "analyzing": "AI가 당신의 감정 선율을 읽고 있습니다...",
        "report_header": "💡 오늘의 감정 분석 리포트",
        "stability_index": "심리 안정 지수",
        "core_sentiment": "핵심 감정",
        "ai_word": "💌 AI의 따뜻한 한마디",
        "prescription_label": "🩹 데일리 처방전",
        "no_analysis": "### 아직 분석된 내용이 없습니다.\n왼쪽에 오늘 하루를 기록하고 분석 버튼을 눌러보세요.",
        "chat_header": "💬 AI 친구 '토닥이'",
        "chat_desc": "당신의 지난 이야기를 기억하고 공감하는 친밀한 대화 상대입니다.",
        "chat_placeholder": "토닥이에게 무엇이든 물어보세요...",
        "wearable_header": "⌚ 스마트 데이터 인사이트",
        "wearable_desc": "웨어러블 기기에서 수집된 신체 신호를 분석하여 스트레스를 사전에 감지합니다.",
        "hr_title": "실시간 심박수 변화 흐름",
        "stress_report": "🚀 스트레스 리포트",
        "stress_load": "현재 스트레스 부하",
        "stress_high": "다소 높음",
        "emergency_alert": "🚨 긴급 알림",
        "emergency_msg": "최근 15분 내 심박수 급증이 포착되었습니다. 집중력이 흐트러질 수 있으니 **3분간의 복식 호흡**을 권장합니다."
    },
    "en": {
        "title": "☁️ SereneSoul",
        "subtitle": "A safe harbor for your mind, warm emotional care powered by AI",
        "tab_prescription": "📝 Daily Sanctuary",
        "tab_chat": "💬 SoulMate AI",
        "tab_wearable": "⌚ Mindset Insights",
        "input_header": "🖋️ How is your heart today?",
        "input_placeholder": "Breathe life into your thoughts here (at least 5 characters)",
        "btn_analyze": "Listen to My Heart",
        "analyzing": "AI is understanding your emotional landscape...",
        "report_header": "💡 Your Emotional Resonance Report",
        "stability_index": "Tranquility Score",
        "core_sentiment": "Key Vibration",
        "ai_word": "💌 A Gentle Whisper from AI",
        "prescription_label": "🩹 Daily Self-Care Guide",
        "no_analysis": "### Your story hasn't started yet.\nWrite about your moment on the left and let's find clarity together.",
        "chat_header": "💬 Your SoulMate 'Serene'",
        "chat_desc": "A compassionate companion who listens to your silence and honors your noise.",
        "chat_placeholder": "Tell Serene everything...",
        "wearable_header": "⌚ Biological Harmony",
        "wearable_desc": "Synchronizing your body's rhythm with AI to anticipate stress before it peaks.",
        "hr_title": "Live Heart Rythm",
        "stress_report": "🚀 Equilibrium Tracker",
        "stress_load": "Emotional Pressure",
        "stress_high": "Seeking Balance",
        "emergency_alert": "🚨 Time to Pause",
        "emergency_msg": "A ripple in your heart rate detected. We suggest **3 minutes of focused breathing** to find your center."
    },
    "ph": {
        "title": "☁️ Kalingang Puso",
        "subtitle": "Sandigan ng iyong kalooban, katuwang sa bawat damdamin at paglalakbay",
        "tab_prescription": "📝 Daily Reseta",
        "tab_chat": "💬 Kaagapay AI",
        "tab_wearable": "⌚ Ulat ng Kalusugan",
        "input_header": "🖋️ Kumusta ang nilalaman ng iyong puso?",
        "input_placeholder": "Ipaabot ang iyong mga saloobin dito (kahit 5 letra)",
        "btn_analyze": "Damhin ang Aking Puso",
        "analyzing": "Binabasa ng AI ang kumpas ng iyong nararamdaman...",
        "report_header": "💡 Ulat ng Pagsusuri ng Iyong Emosyon",
        "stability_index": "Index ng Kapanatagan",
        "core_sentiment": "Pangunahing Diwa",
        "ai_word": "💌 Malasakit na Salita mula sa AI",
        "prescription_label": "🩹 Payo Para sa Araw na Ito",
        "no_analysis": "### Magkuwento ka, handa akong makinig.\nIsulat ang iyong karanasan sa kaliwa para sa mas malalim na pag-unawa.",
        "chat_header": "💬 Ang Iyong Kaagapay 'Linga'",
        "chat_desc": "Isang matapat na kaibigan na laging handang dumamay at makinig sa iyong kwento.",
        "chat_placeholder": "Kausapin si Linga...",
        "wearable_header": "⌚ Talino ng Iyong Katawan",
        "wearable_desc": "Pagsusuri sa mga signal ng iyong wearables para sa maagang pag-iwas sa stress.",
        "hr_title": "Daloy ng Pintig ng Puso",
        "stress_report": "🚀 Ulat ng Kapaguran",
        "stress_load": "Antas ng Stress",
        "stress_high": "Masyadong Pagod",
        "emergency_alert": "🚨 Mahalagang Babala",
        "emergency_msg": "May nakitang mabilis na pagtibok ng puso sa nakalipas na 15 minuto. Inirerekomenda namin ang **3 minutong paghinga nang malalim**."
    },
    "zh": {
        "title": "☁️ 舒心小站",
        "subtitle": "您心灵的栖息地，AI为您提供温暖的情感关怀",
        "tab_prescription": "📝 每日处方",
        "tab_chat": "💬 AI 伴侣",
        "tab_wearable": "⌚ 穿戴设备报告",
        "input_header": "🖋️ 今天过得怎么样？",
        "input_placeholder": "在这里倾诉您的感受（至少5个字符）",
        "btn_analyze": "分析我的心情",
        "analyzing": "AI 正在解读您的情感旋律...",
        "report_header": "💡 今日情感分析报告",
        "stability_index": "心理稳定指数",
        "core_sentiment": "核心情感",
        "ai_word": "💌 来自 AI 的温暖寄语",
        "prescription_label": "🩹 每日生活处方",
        "no_analysis": "### 暂无分析内容。\n请在左侧记录您的生活并点击分析按钮。",
        "chat_header": "💬 您的 AI 好友 '舒心'",
        "chat_desc": "一个能记住并理解您过去故事的亲密伙伴。",
        "chat_placeholder": "想对舒心说点什么...",
        "wearable_header": "⌚ 智能数据洞察",
        "wearable_desc": "分析穿戴设备数据，预警压力状态。",
        "hr_title": "实时心率变化趋势",
        "stress_report": "🚀 压力分析报告",
        "stress_load": "当前压力负载",
        "stress_high": "略高",
        "emergency_alert": "🚨 紧急预警",
        "emergency_msg": "检测到近15分钟内心率异常升高。建议您进行 **3分钟深呼吸** 以缓解情绪。"
    }
}

# Language Picker at the top
col_title, col_lang = st.columns([3, 1])

with col_lang:
    lang_code = st.selectbox("", options=["ko", "en", "ph", "zh"], 
                             format_func=lambda x: "🇰🇷 한국어" if x=="ko" else "🇺🇸 English" if x=="en" else "🇵🇭 Tagalog" if x=="ph" else "🇨🇳 简体中文",
                             label_visibility="collapsed")

t = TRANSLATIONS[lang_code]

# Advanced Premium CSS Injection
st.markdown("""
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=Noto+Sans+KR:wght@300;400;700&display=swap" rel="stylesheet">
    
    <style>
    /* Global Styles */
    html, body, [class*="st-"] {
        font-family: 'Outfit', 'Noto Sans KR', sans-serif;
    }
    
    .stApp {
        background-color: #f0f2f6;
    }

    [data-testid="stAppViewContainer"] {
        background: 
            radial-gradient(at 0% 0%, rgba(135, 176, 255, 0.1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, rgba(180, 140, 255, 0.1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(255, 180, 130, 0.1) 0, transparent 50%),
            radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.5) 0, transparent 50%),
            #f9faff;
    }

    /* Move the top selectbox a bit to align with header */
    div[data-testid="stColumn"]:nth-child(2) {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-top: 1.5rem;
    }

    /* Glassmorphism Refined */
    .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 30px;
        padding: 2.5rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
        margin-bottom: 25px;
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .glass-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 60px rgba(31, 38, 135, 0.08);
        background: rgba(255, 255, 255, 0.8);
    }

    /* Custom Header */
    .app-header {
        text-align: center;
        padding: 2rem 0;
        margin-bottom: 2rem;
    }
    
    .app-title {
        font-size: 4rem !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -2px;
        margin-bottom: 5px;
        filter: drop-shadow(0 4px 8px rgba(118, 75, 162, 0.1));
    }
    
    .app-subtitle {
        color: #8e9aaf;
        font-weight: 300;
        font-size: 1.25rem;
        letter-spacing: 0.5px;
    }

    /* Sidebar Styling */
    [data-testid="stSidebar"] {
        background-color: rgba(255, 255, 255, 0.4);
        border-right: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Prescription UI Components */
    .sentiment-badge {
        display: inline-block;
        padding: 8px 18px;
        border-radius: 50px;
        font-weight: 600;
        margin-bottom: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .prescription-box {
        background: rgba(255, 255, 255, 0.5);
        border-left: 6px solid #a777e3;
        padding: 20px;
        border-radius: 18px;
        margin-top: 20px;
        font-size: 1.1rem;
        line-height: 1.6;
    }

    /* Streamlit UI Overrides - Enhanced Analyze Button */
    .stButton>button {
        width: auto !important;
        min-width: 300px;
        border-radius: 100px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white !important;
        font-weight: 700 !important;
        font-size: 1.3rem !important;
        border: none;
        padding: 18px 50px !important;
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: block;
        margin: 30px auto !important;
        white-space: nowrap;
    }
    
    .stButton>button:hover {
        transform: scale(1.04) translateY(-3px);
        box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
        color: white !important;
    }

    .stTabs [data-baseweb="tab-list"] {
        gap: 15px;
        background-color: rgba(255, 255, 255, 0.2);
        padding: 10px;
        border-radius: 20px;
        justify-content: center;
    }

    .stTabs [data-baseweb="tab"] {
        height: 50px;
        background-color: transparent;
        border-radius: 15px;
        padding: 0 25px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .stTabs [aria-selected="true"] {
        background-color: white !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border-radius: 12px !important;
        font-weight: 700 !important;
    }

    /* Floating Animation */
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }

    .stTextArea textarea {
        background: rgba(255, 255, 255, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 20px !important;
        padding: 20px !important;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }

    .stTextArea textarea:focus {
        background: rgba(255, 255, 255, 0.7) !important;
        border-color: #667eea !important;
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.1) !important;
    }
    </style>
""", unsafe_allow_html=True)

# Custom Header Section
st.markdown(f"""
<div class="app-header">
    <div class="app-title">{t['title']}</div>
    <div class="app-subtitle">{t['subtitle']}</div>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3 = st.tabs([t['tab_prescription'], t['tab_chat'], t['tab_wearable']])

with tab1:
    col_input, col_output = st.columns([1, 1], gap="large")
    
    with col_input:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.subheader(t['input_header'])
        diary_content = st.text_area("", placeholder=t['input_placeholder'], height=300, label_visibility="collapsed")
        analyze_btn = st.button(t['btn_analyze'])
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col_output:
        if analyze_btn:
            if len(diary_content.strip()) >= 5:
                with st.spinner(t['analyzing']):
                    try:
                        response = requests.post("http://localhost:8000/analyze-sentiment", json={"content": diary_content, "lang": lang_code})
                        if response.status_code == 200:
                            result = response.json()
                            
                            st.markdown(f'<div class="glass-card">', unsafe_allow_html=True)
                            st.subheader(t['report_header'])
                            
                            c1, c2 = st.columns(2)
                            with c1:
                                index_color = "#4CAF50" if result['index'] > 60 else "#FF9800" if result['index'] > 30 else "#F44336"
                                st.markdown(f"### <span style='color:{index_color}'>{result['index']}/100</span>", unsafe_allow_html=True)
                                st.write(t['stability_index'])
                            with c2:
                                st.markdown(f"<div class='sentiment-badge' style='background:{index_color}33; color:{index_color}'>#{result['sentiment']}</div>", unsafe_allow_html=True)
                                st.write(t['core_sentiment'])
                            
                            st.markdown("---")
                            st.write(f"**{t['ai_word']}**")
                            st.write(result['summary'])
                            
                            st.markdown(f"""
                            <div class="prescription-box">
                                <b>{t['prescription_label']}</b><br>
                                {result['prescription']}
                            </div>
                            """, unsafe_allow_html=True)
                            st.markdown('</div>', unsafe_allow_html=True)
                        else:
                            st.error(f"Error: {response.text}")
                    except Exception as e:
                        st.error(f"Error: {e}")
            else:
                st.warning("Please tell me more (at least 5 chars).")
        else:
            st.markdown(f'<div class="glass-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; text-align: center;">{t["no_analysis"]}</div>', unsafe_allow_html=True)

with tab2:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.header(t['chat_header'])
    st.write(t['chat_desc'])
    st.markdown('</div>', unsafe_allow_html=True)

    chat_container = st.container()
    if "messages" not in st.session_state:
        st.session_state.messages = []

    with chat_container:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    if prompt := st.chat_input(t['chat_placeholder']):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            try:
                # Prepare history for backend
                history = []
                for msg in st.session_state.messages[:-1]: # Exclude the current user message just added
                    history.append({"role": msg["role"], "content": msg["content"]})
                
                response = requests.post("http://localhost:8000/chat", 
                                         json={"message": prompt, "history": history, "lang": lang_code})
                if response.status_code == 200:
                    ai_response = response.json()["response"]
                    st.markdown(ai_response)
                    st.session_state.messages.append({"role": "assistant", "content": ai_response})
                else:
                    st.error("Error connecting to AI.")
            except Exception as e:
                st.error(f"Error: {e}")

with tab3:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.header(t['wearable_header'])
    st.write(t['wearable_desc'])
    st.markdown('</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        now = datetime.now()
        chart_data = pd.DataFrame({
            'Time': pd.date_range(end=now, periods=20, freq='2min'),
            'Heart Rate (BPM)': [72, 74, 71, 68, 70, 75, 82, 95, 102, 98, 85, 76, 74, 72, 71, 73, 75, 74, 72, 70]
        })
        fig = px.area(chart_data, x='Time', y='Heart Rate (BPM)', 
                      title=t['hr_title'],
                      color_discrete_sequence=['#e74c3c'])
        fig.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
    with col2:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.subheader(t['stress_report'])
        stress_val = 68
        st.progress(stress_val / 100)
        st.write(f"{t['stress_load']}: **{stress_val}% ({t['stress_high']})**")
        
        if chart_data['Heart Rate (BPM)'].max() > 100:
            st.markdown(f"""
            <div style="background: rgba(244, 67, 54, 0.1); padding: 15px; border-radius: 12px; border: 1px solid #f44336; color: #f44336;">
                <b>{t['emergency_alert']}</b><br>
                {t['emergency_msg']}
            </div>
            """, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
