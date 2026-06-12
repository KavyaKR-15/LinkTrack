function parseUserAgent(ua) {
  if (!ua) {
    return {
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown'
    };
  }

  // 1. Device Classification
  let device = 'Desktop';
  const uaLower = ua.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/i.test(uaLower)) {
    device = 'Tablet';
  } else if (/mobile|phone|android|iphone|ipod|blackberry|iemobile/i.test(uaLower)) {
    device = 'Mobile';
  } else if (/bot|crawl|spider|slurp|yahoo|bing/i.test(uaLower)) {
    device = 'Unknown';
  }

  // 2. OS Classification
  let os = 'Unknown';
  if (/windows/i.test(uaLower)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(uaLower)) {
    os = 'macOS';
  } else if (/iphone|ipad|ipod/i.test(uaLower)) {
    os = 'iOS';
  } else if (/android/i.test(uaLower)) {
    os = 'Android';
  } else if (/linux/i.test(uaLower)) {
    os = 'Linux';
  }

  // 3. Browser Classification
  let browser = 'Unknown';
  if (/chrome|crios/i.test(uaLower) && !/edge|edg|opr|opios/i.test(uaLower)) {
    browser = 'Chrome';
  } else if (/safari/i.test(uaLower) && !/chrome|crios|edge|edg|opr|opios/i.test(uaLower)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(uaLower)) {
    browser = 'Firefox';
  } else if (/edge|edg/i.test(uaLower)) {
    browser = 'Edge';
  } else if (/opr|opera/i.test(uaLower)) {
    browser = 'Opera';
  } else if (/msie|trident/i.test(uaLower)) {
    browser = 'Internet Explorer';
  }

  return { device, browser, os };
}

module.exports = parseUserAgent;
