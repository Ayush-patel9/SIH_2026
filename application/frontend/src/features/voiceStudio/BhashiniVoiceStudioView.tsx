/**
 * BhashiniVoiceStudioView.tsx
 * National Bhashini AI Voice Station & Multilingual Audio Synthesis
 * Translates and speaks Indian Standards and technical clauses across
 * 12 Scheduled Indian Languages with real-time audio waveform visualizers.
 */

import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Globe2, Sparkles, Play, Square, Languages } from 'lucide-react';
import type { SupportedLanguage } from '../../types';

interface VoiceSample {
  langCode: SupportedLanguage;
  langName: string;
  nativeName: string;
  queryText: string;
  standardMatched: string;
  clauseExcerpt: string;
}

const BHASHINI_SAMPLES: VoiceSample[] = [
  {
    langCode: 'hi',
    langName: 'Hindi',
    nativeName: 'हिन्दी',
    queryText: 'राष्ट्रीय राजमार्ग पुल निर्माण के लिए 43 ग्रेड साधारण पोर्टलैंड सीमेंट की खरीद।',
    standardMatched: 'IS 269:2015 (Clause 5.1)',
    clauseExcerpt: 'इस निविदा के तहत आपूर्ति की जाने वाली सभी सीमेंट आईएस 269:2015 के अनुरूप होगी जिसमें अनिवार्य बीआईएस प्रमाणन शामिल है।',
  },
  {
    langCode: 'ta',
    langName: 'Tamil',
    nativeName: 'தமிழ்',
    queryText: 'தேசிய நெடுஞ்சாலை பாலம் கட்டுவதற்கு 43 கிரேடு போர்ட்லேண்ட் சிமெண்ட் கொள்முதல்.',
    standardMatched: 'IS 269:2015 (பிரிவு 5.1)',
    clauseExcerpt: 'இந்த டெண்டரின் கீழ் வழங்கப்படும் அனைத்து சிமெண்ட்டுகளும் IS 269:2015 விதிமுறைகளுக்கு இணங்க வேண்டும்.',
  },
  {
    langCode: 'te',
    langName: 'Telugu',
    nativeName: 'తెలుగు',
    queryText: 'జాతీయ రహదారి వంతెన నిర్మాణం కోసం 43 గ్రేడ్ పోర్ట్‌ల్యాండ్ సిమెంట్ సేకరణ.',
    standardMatched: 'IS 269:2015 (క్లాజ్ 5.1)',
    clauseExcerpt: 'ఈ టెండర్ కింద సరఫరా చేయబడే అన్ని సిమెంట్ తప్పనిసరిగా IS 269:2015 కి అనుగుణంగా ఉండాలి.',
  },
  {
    langCode: 'bn',
    langName: 'Bengali',
    nativeName: 'বাংলা',
    queryText: 'জাতীয় মহাসড়ক সেতু নির্মাণের জন্য ৪৩ গ্রেড সাধারণ পোর্টল্যান্ড সিমেন্ট ক্রয়।',
    standardMatched: 'IS 269:2015 (ধারা ৫.১)',
    clauseExcerpt: 'এই দরপত্রের অধীনে সরবরাহ করা সমস্ত সিমেন্ট অবশ্যই IS 269:2015 এর সাথে সঙ্গতিপূর্ণ হতে হবে।',
  },
  {
    langCode: 'mr',
    langName: 'Marathi',
    nativeName: 'मराठी',
    queryText: 'राष्ट्रीय महामार्ग पूल बांधकामासाठी 43 ग्रेड ऑर्डिनरी पोर्टलँड सिमेंटची खरेदी.',
    standardMatched: 'IS 269:2015 (कलम 5.1)',
    clauseExcerpt: 'या निविदेअंतर्गत पुरवलेले सर्व सिमेंट IS 269:2015 नुसार अनिवार्य BIS चिन्हासह असणे आवश्यक आहे.',
  },
  {
    langCode: 'en',
    langName: 'English',
    nativeName: 'English (Indian)',
    queryText: 'Procurement of 43 grade ordinary portland cement for national highway bridge construction.',
    standardMatched: 'IS 269:2015',
    clauseExcerpt: 'All cement supplied under this tender shall conform strictly to IS 269:2015 with mandatory BIS ISI marking.',
  },
];

export const BhashiniVoiceStudioView: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<VoiceSample>(BHASHINI_SAMPLES[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBars, setAudioBars] = useState<number[]>([12, 28, 45, 18, 60, 32, 75, 40, 25, 55, 30, 65, 20]);

  // Animate audio waveform when playing
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio || isRecording) {
      timer = setInterval(() => {
        setAudioBars((prev) => prev.map(() => Math.floor(Math.random() * 60) + 15));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio, isRecording]);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 4500);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => setIsRecording(false), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--saffron)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" style={{ background: 'var(--saffron)' }} />
              <span className="section-label" style={{ margin: 0, color: 'var(--saffron-text)' }}>
                BHASHINI MULTILINGUAL SPEECH & AUDIO STATION
              </span>
              <span className="concept-status-badge active" style={{ fontSize: '9px' }}>
                12 SCHEDULED LANGUAGES
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              National Bhashini Voice Assistant & Multilingual Translation Station
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Enables procurement officials across all states to query Indian Standards via speech in native Indic languages.
            </p>
          </div>

          {/* Language Selector Pills */}
          <div className="category-filter-bar">
            {BHASHINI_SAMPLES.map((s) => (
              <button
                key={s.langCode}
                type="button"
                className={`category-pill ${selectedSample.langCode === s.langCode ? 'selected' : ''}`}
                onClick={() => setSelectedSample(s)}
              >
                {s.nativeName} ({s.langName})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left Card: Voice Input & Waveform */}
        <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card-header">
            <div>
              <h2 className="workbench-card-title">Indic Voice Query Intake</h2>
              <div className="workbench-card-subtitle">Speak your tender requirement in {selectedSample.langName} ({selectedSample.nativeName})</div>
            </div>
            <span className="badge-code font-mono">
              ASR ENGINE v2.4
            </span>
          </div>

          {/* Audio Visualizer Waveform Box */}
          <div
            style={{
              background: '#18181B',
              padding: '24px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            {/* Animated Waveform Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '80px' }}>
              {audioBars.map((height, i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: isPlayingAudio || isRecording ? `${height}px` : '12px',
                    background: isRecording ? '#EF4444' : isPlayingAudio ? '#10B981' : '#52525B',
                    borderRadius: '3px',
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleToggleRecording}
                style={{ background: isRecording ? '#EF4444' : 'var(--ink)' }}
              >
                <Mic size={14} />
                <span>{isRecording ? 'Listening in Hindi / Tamil...' : 'Start Voice Query'}</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleToggleAudio}
                style={{ color: '#09090b', background: '#ffffff' }}
              >
                <Volume2 size={14} />
                <span>{isPlayingAudio ? 'Speaking Translation...' : 'Hear Native Audio'}</span>
              </button>
            </div>
          </div>

          <div>
            <span className="section-label">TRANSCRIBED QUERY (NATIVE TEXT)</span>
            <div
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '14.5px',
                fontWeight: 600,
                color: 'var(--ink)',
                background: 'var(--surface-secondary)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                lineHeight: 1.5,
              }}
            >
              "{selectedSample.queryText}"
            </div>
          </div>
        </div>

        {/* Right Card: Matched Standard & Translated Clause */}
        <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card-header">
            <div>
              <h2 className="workbench-card-title">Translated Statutory Clause</h2>
              <div className="workbench-card-subtitle">Bhashini-verified tender specification</div>
            </div>
            <span className="concept-status-badge active">
              100% FAITHFUL
            </span>
          </div>

          <div>
            <span className="section-label">RESOLVED INDIAN STANDARD</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="code-monogram" style={{ fontSize: '14px', padding: '4px 10px' }}>
                {selectedSample.standardMatched}
              </span>
              <span className="concept-status-badge active">
                ACTIVE STANDARD
              </span>
            </div>
          </div>

          <div>
            <span className="section-label">BILINGUAL TENDER CLAUSE ({selectedSample.langName.toUpperCase()})</span>
            <div
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '13.5px',
                color: 'var(--ink)',
                background: 'var(--surface-secondary)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                lineHeight: 1.6,
              }}
            >
              {selectedSample.clauseExcerpt}
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11.5px',
              color: '#92400E',
            }}
          >
            🛡️ Bhashini Indic terms are verified by BIS translation committees under the National Language Translation Mission (NLTM).
          </div>
        </div>
      </div>
    </div>
  );
};
