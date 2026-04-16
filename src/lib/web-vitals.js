function sendToAnalytics(metric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    page: window.location.pathname,
    effectiveType: navigator.connection?.effectiveType ?? 'unknown',
    timestamp: Date.now(),
  });

  const url = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/vitals';

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function initWebVitals() {
  const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals/attribution');
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

export async function initWebVitalsDev() {
  const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals/attribution');
  const log = (m) => {
    const color =
      m.rating === 'good' ? '#0CCE6B' : m.rating === 'needs-improvement' ? '#FFA400' : '#FF4E42';
    console.log(
      `%c${m.name} %c${m.value.toFixed(m.name === 'CLS' ? 3 : 0)}${m.name === 'CLS' ? '' : 'ms'} %c(${m.rating})`,
      'font-weight:bold;font-size:14px;',
      `color:${color};font-weight:bold;font-size:14px;`,
      `color:${color};`
    );
  };
  onCLS(log);
  onINP(log);
  onLCP(log);
  onFCP(log);
  onTTFB(log);
}
