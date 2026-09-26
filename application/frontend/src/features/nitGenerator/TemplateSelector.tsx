import React from 'react';
import { NIT_TEMPLATES } from './clauseTemplates';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  className?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  className = '',
}) => {
  const currentConfig = NIT_TEMPLATES[selectedTemplate] || NIT_TEMPLATES.standard_gem;

  return (
    <div className={`template-selector ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-label" style={{ margin: 0 }}>
          SELECT PROCUREMENT PORTAL / TEMPLATE FORMAT
        </span>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--collapse-cobalt)' }}>
          {currentConfig.badge}
        </span>
      </div>

      <div className="palette" style={{ margin: 0 }}>
        {Object.values(NIT_TEMPLATES).map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            className={`palette-btn ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
            onClick={() => onSelectTemplate(tmpl.id)}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-prose)',
          fontSize: '12px',
          color: 'var(--ink-secondary)',
          background: 'var(--paper)',
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid var(--hairline)',
        }}
      >
        <strong>{currentConfig.portal}: </strong>
        {currentConfig.description}
      </div>
    </div>
  );
};
