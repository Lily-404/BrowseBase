import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Icon from '../components/ui/Icon';
import PixelLoader from '../components/ui/PixelLoader';
import { audioLoader } from '../utils/audioLoader';
import { loadNothingFonts } from '../utils/loadNothingFonts';
import { resourceService, ResourceStats } from '../services/resourceService';
import { useTranslation } from 'react-i18next';
import '../styles/nothing.css';

const GOAL = 1000;
const SEGMENTS = 40;

const CATEGORY_DOT: Record<string, string> = {
  ai: '#f09a2f',
  docs: '#16a6c7',
  tools: '#25a878',
  dev: '#5b9bf6',
  design: '#e85a5a',
  blog: '#a855f7',
  resources: '#999999',
};

const TAG_COLORS: Record<string, string> = {
  trending: '#f09a2f',
  newAdded: '#92b72d',
  socialMedia: '#ee6572',
  mac: '#3f78ff',
  communityChoice: '#9a5cff',
  openSource: '#25a878',
};

function SegmentedBar({
  filled,
  total = SEGMENTS,
  accent = false,
  small = false,
}: {
  filled: number;
  total?: number;
  accent?: boolean;
  small?: boolean;
}) {
  const bits = Math.max(0, Math.min(total, Math.round(filled)));
  return (
    <div className={`about-seg${small ? ' about-seg-sm' : ''}`} aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`about-seg-bit${i < bits ? ` is-filled${accent ? ' is-accent' : ''}` : ''}`}
        />
      ))}
    </div>
  );
}

const About: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNothingFonts();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resourceService
      .fetchResourceStats({ tagTopN: 6 })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const playClickSound = () => {
    audioLoader.playSound('/click.wav');
  };

  const total = stats?.total ?? 0;
  const progressPct = Math.min(100, Math.round((total / GOAL) * 100));
  const progressFilled = (total / GOAL) * SEGMENTS;
  const maxCategory = Math.max(1, ...(stats?.byCategory.map((c) => c.count) ?? [1]));
  const maxTag = Math.max(1, ...(stats?.byTag.map((c) => c.count) ?? [1]));

  const categoryLabel = (id: string) => {
    const key = `category.${id}`;
    const translated = t(key);
    return translated === key ? id : translated;
  };

  const tagLabel = (id: string) => {
    const key = `filter.${id}`;
    const translated = t(key);
    return translated === key ? id : translated;
  };

  return (
    <div className="nd nd-light nd-dot-grid about-page">
      <Header mode="about" />
      <main className="about-main">
        <header className="about-hero">
          <div className="about-hero-top">
            <div>
              <p className="nd-label mb-2">{t('about.label')}</p>
              <h1 className="nd-heading text-[28px] tracking-tight">{t('about.brand')}</h1>
            </div>
          </div>

          <div className="about-metric">
            <span className="nd-display" aria-label={t('about.stats.overview')}>
              {loading ? '—' : total}
            </span>
            <span className="about-metric-unit">{t('about.stats.goalUnit')}</span>
          </div>

          {loading ? (
            <div className="about-status">
              <PixelLoader label={t('about.stats.loading')} variant="Drive" />
            </div>
          ) : (
            <div className="about-progress">
              <div className="about-progress-meta">
                <span className="nd-label">{t('about.stats.goalProgress')}</span>
                <span className="about-progress-value">{progressPct}%</span>
              </div>
              <SegmentedBar filled={progressFilled} accent />
            </div>
          )}
        </header>

        {!loading && stats && (
          <div className="about-grid">
            <section className="about-panel" aria-label={t('about.stats.categoryDist')}>
              <h2 className="about-panel-title">{t('about.stats.categoryDist')}</h2>
              {stats.byCategory.length === 0 ? (
                <p className="nd-caption text-[var(--nd-text-disabled)]">—</p>
              ) : (
                stats.byCategory.map((item) => (
                  <div key={item.id} className="about-dist-row">
                    <span className="about-dist-name" title={categoryLabel(item.id)}>
                      <span
                        className="about-dist-dot"
                        style={{ background: CATEGORY_DOT[item.id] || '#7f858d' }}
                      />
                      {categoryLabel(item.id)}
                    </span>
                    <SegmentedBar
                      filled={(item.count / maxCategory) * SEGMENTS}
                      small
                    />
                    <span className="about-dist-count">{item.count}</span>
                  </div>
                ))
              )}
            </section>

            <section className="about-panel" aria-label={t('about.stats.tagDist')}>
              <h2 className="about-panel-title">{t('about.stats.tagDist')}</h2>
              {stats.byTag.length === 0 ? (
                <p className="nd-caption text-[var(--nd-text-disabled)]">—</p>
              ) : (
                stats.byTag.map((item) => (
                  <div key={item.id} className="about-dist-row">
                    <span className="about-dist-name" title={tagLabel(item.id)}>
                      <span
                        className="about-dist-dot"
                        style={{ background: TAG_COLORS[item.id] || '#7f858d' }}
                      />
                      {tagLabel(item.id)}
                    </span>
                    <SegmentedBar filled={(item.count / maxTag) * SEGMENTS} small />
                    <span className="about-dist-count">{item.count}</span>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        <section className="about-section">
          <h2 className="about-section-title">{t('about.origin.heading')}</h2>
          <div className="about-prose">
            <p>{t('about.origin.p1')}</p>
            <p>
              {t('about.origin.p2_line1')} {t('about.origin.p2_line2')}
            </p>
            <p>
              {t('about.origin.p3_line1')} {t('about.origin.p3_line2')}{' '}
              {t('about.origin.p3_line3')}
            </p>
            <p>
              {t('about.origin.p4_line1')} {t('about.origin.p4_line2')}{' '}
              {t('about.origin.p4_line3')}
            </p>
          </div>
        </section>

        <div className="about-meta-list">
          <div className="about-meta-row">
            <span className="about-meta-label">{t('about.update.heading')}</span>
            <p className="about-meta-body">{t('about.update.p1')}</p>
          </div>

          <div className="about-meta-row">
            <span className="about-meta-label">{t('about.blog.heading')}</span>
            <div className="about-meta-body">
              <a
                href="https://www.jimmy-blog.top/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClickSound}
                className="about-meta-link"
              >
                jimmy-blog.top
                <Icon name="ExternalLink" size={14} />
              </a>
            </div>
          </div>

          <div className="about-meta-row">
            <span className="about-meta-label">{t('about.opensource.heading')}</span>
            <div className="about-meta-body space-y-2">
              <a
                href="https://github.com/Lily-404/BrowseBase"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClickSound}
                className="about-meta-link"
              >
                Lily-404/BrowseBase
                <Icon name="ExternalLink" size={14} />
              </a>
              <div>
                <span className="text-[var(--nd-text-secondary)] text-[13px]">
                  {t('about.opensource.inspiredBy')}
                </span>{' '}
                <a
                  href="https://github.com/openai/openai-fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClickSound}
                  className="about-meta-link"
                >
                  openai/openai-fm
                  <Icon name="ExternalLink" size={14} />
                </a>
              </div>
            </div>
          </div>

          <div className="about-meta-row">
            <span className="about-meta-label">{t('about.contact.heading')}</span>
            <p className="about-meta-body">{t('about.contact.wechat')}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
