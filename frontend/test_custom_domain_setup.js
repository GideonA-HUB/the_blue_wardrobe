/**
 * Test script to analyze and verify custom domain setup
 * This ensures thebluewardrobe.ng and www.thebluewardrobe.ng are properly configured
 */

// Test functions
function analyzeDNSRecords() {
  console.log("Analyzing DNS records from HostAfrica...");
  
  const hostAfricaRecords = [
    {
      name: '@',
      type: 'SOA',
      ttl: '86400',
      rdata: 'ns1.host-ww.net server-admin.cloud2m.co.za 2026032508 3600 1800 1209600 86400',
      status: 'Standard SOA record - OK'
    },
    {
      name: '@',
      type: 'A',
      ttl: '14440',
      rdata: '76.76.21.21',
      status: '⚠️  ISSUE: Should point to Railway, not direct IP'
    },
    {
      name: '@',
      type: 'NS',
      ttl: '86400',
      rdata: 'ns2.host-ww.net',
      status: 'Nameserver record - OK'
    },
    {
      name: '@',
      type: 'NS',
      ttl: '86400',
      rdata: 'ns1.host-ww.net',
      status: 'Nameserver record - OK'
    },
    {
      name: '@',
      type: 'MX',
      ttl: '14400',
      rdata: '0 thebluewardrobe.ng',
      status: 'Mail exchange record - OK'
    },
    {
      name: '_railway-verify.www',
      type: 'TXT',
      ttl: '14440',
      rdata: '"railway-verify=51f72a6fe84b7e3cb6afbfb9ffe58a92ba60a59fd9ab21e9c9c669cd02361ab0"',
      status: '✅ Railway verification for www subdomain - OK'
    },
    {
      name: 'mail',
      type: 'CNAME',
      ttl: '14400',
      rdata: 'thebluewardrobe.ng',
      status: 'Mail CNAME - OK'
    },
    {
      name: 'ftp',
      type: 'CNAME',
      ttl: '14400',
      rdata: 'thebluewardrobe.ng',
      status: 'FTP CNAME - OK'
    },
    {
      name: 'www',
      type: 'CNAME',
      ttl: '14440',
      rdata: 'feg5ngy8.up.railway.app',
      status: '✅ www subdomain correctly pointing to Railway - OK'
    }
  ];
  
  console.log('HostAfrica DNS Records Analysis:');
  hostAfricaRecords.forEach(record => {
    console.log(`${record.status.includes('⚠️') ? '⚠️' : '✅'} ${record.name} (${record.type}): ${record.rdata}`);
    console.log(`   Status: ${record.status}`);
  });
  
  return hostAfricaRecords;
}

function analyzeRailwayRecords() {
  console.log("\nAnalyzing Railway DNS records...");
  
  const railwayRecords = [
    {
      domain: 'thebluewardrobe.ng',
      type: 'CNAME',
      name: '@',
      value: '1tmjhoej.up.railway.app',
      txtVerify: {
        type: 'TXT',
        name: '_railway-verify',
        value: 'railway-verify=2424d909686a3a76ec74a65e1355ea046390f77e2c75744f93a9b2c5c358edb2'
      }
    },
    {
      domain: 'www.thebluewardrobe.ng',
      type: 'CNAME',
      name: 'www',
      value: 'feg5ngy8.up.railway.app',
      txtVerify: {
        type: 'TXT',
        name: '_railway-verify.www',
        value: 'railway-verify=51f72a6fe84b7e3cb6afbfb9ffe58a92ba60a59fd9ab21e9c9c669cd02361ab0'
      }
    }
  ];
  
  console.log('Railway DNS Requirements:');
  railwayRecords.forEach(record => {
    console.log(`✅ ${record.domain}:`);
    console.log(`   - CNAME ${record.name}: ${record.value}`);
    console.log(`   - TXT ${record.txtVerify.name}: ${record.txtVerify.value}`);
  });
  
  return railwayRecords;
}

function identifyIssues() {
  console.log("\nIdentifying configuration issues...");
  
  const issues = [
    {
      severity: 'HIGH',
      issue: 'Root domain (@) A record points to IP instead of Railway CNAME',
      current: 'A record: 76.76.21.21',
      shouldBe: 'CNAME record: 1tmjhoej.up.railway.app',
      impact: 'Root domain will not resolve to Railway application'
    },
    {
      severity: 'HIGH',
      issue: 'Missing Railway verification TXT record for root domain',
      current: 'No _railway-verify TXT record',
      shouldBe: 'TXT _railway-verify: railway-verify=2424d909686a3a76ec74a65e1355ea046390f77e2c75744f93a9b2c5c358edb2',
      impact: 'Railway cannot verify domain ownership'
    },
    {
      severity: 'MEDIUM',
      issue: 'www subdomain is correctly configured',
      current: 'CNAME www: feg5ngy8.up.railway.app',
      shouldBe: 'Already correct',
      impact: 'No issues with www subdomain'
    }
  ];
  
  issues.forEach(issue => {
    const icon = issue.severity === 'HIGH' ? '🚨' : '⚠️';
    console.log(`${icon} ${issue.severity}: ${issue.issue}`);
    console.log(`   Current: ${issue.current}`);
    console.log(`   Should be: ${issue.shouldBe}`);
    console.log(`   Impact: ${issue.impact}`);
  });
  
  return issues;
}

function generateDNSFixes() {
  console.log("\nGenerating DNS fixes for HostAfrica...");
  
  const fixes = [
    {
      action: 'DELETE',
      name: '@',
      type: 'A',
      currentValue: '76.76.21.21',
      reason: 'Remove incorrect A record pointing to IP'
    },
    {
      action: 'ADD',
      name: '@',
      type: 'CNAME',
      value: '1tmjhoej.up.railway.app',
      reason: 'Point root domain to Railway'
    },
    {
      action: 'ADD',
      name: '_railway-verify',
      type: 'TXT',
      value: 'railway-verify=2424d909686a3a76ec74a65e1355ea046390f77e2c75744f93a9b2c5c358edb2',
      reason: 'Railway domain verification'
    }
  ];
  
  console.log('Required DNS Changes:');
  fixes.forEach(fix => {
    console.log(`${fix.action}: ${fix.name} (${fix.type})`);
    console.log(`   Value: ${fix.value || 'DELETE'}`);
    console.log(`   Reason: ${fix.reason}`);
  });
  
  return fixes;
}

function checkDjangoSettings() {
  console.log("\nChecking Django settings for custom domains...");
  
  const currentSettings = {
    allowedHosts: [
      "thebluewardrobe-production.up.railway.app",
      ".up.railway.app",
      ".railway.app",
      ".railway.internal",
      "localhost",
      "127.0.0.1"
    ],
    corsOrigins: 'http://localhost:5173',
    csrfTrustedOrigins: 'https://thebluewardrobe-production.up.railway.app,https://*.up.railway.app'
  };
  
  const requiredUpdates = [
    {
      setting: 'ALLOWED_HOSTS',
      current: currentSettings.allowedHosts,
      needed: ['thebluewardrobe.ng', 'www.thebluewardrobe.ng', ...currentSettings.allowedHosts],
      envVar: 'ALLOWED_HOSTS=thebluewardrobe.ng,www.thebluewardrobe.ng'
    },
    {
      setting: 'CORS_ALLOWED_ORIGINS',
      current: currentSettings.corsOrigins,
      needed: 'https://thebluewardrobe.ng,https://www.thebluewardrobe.ng,http://localhost:5173',
      envVar: 'CORS_ALLOWED_ORIGINS=https://thebluewardrobe.ng,https://www.thebluewardrobe.ng,http://localhost:5173'
    },
    {
      setting: 'CSRF_TRUSTED_ORIGINS',
      current: currentSettings.csrfTrustedOrigins,
      needed: 'https://thebluewardrobe.ng,https://www.thebluewardrobe.ng,https://thebluewardrobe-production.up.railway.app,https://*.up.railway.app',
      envVar: 'CSRF_TRUSTED_ORIGINS=https://thebluewardrobe.ng,https://www.thebluewardrobe.ng,https://thebluewardrobe-production.up.railway.app,https://*.up.railway.app'
    }
  ];
  
  console.log('Required Django Settings Updates:');
  requiredUpdates.forEach(update => {
    console.log(`\n🔧 ${update.setting}:`);
    console.log(`   Current: ${update.current}`);
    console.log(`   Needed: ${update.needed}`);
    console.log(`   Environment Variable: ${update.envVar}`);
  });
  
  return requiredUpdates;
}

function generateImplementationSteps() {
  console.log("\nGenerating implementation steps...");
  
  const steps = [
    {
      step: 1,
      title: 'Fix DNS Records at HostAfrica',
      actions: [
        'Delete A record for @ pointing to 76.76.21.21',
        'Add CNAME record for @ pointing to 1tmjhoej.up.railway.app',
        'Add TXT record for _railway-verify with Railway verification code'
      ],
      priority: 'HIGH'
    },
    {
      step: 2,
      title: 'Update Railway Environment Variables',
      actions: [
        'Add ALLOWED_HOSTS=thebluewardrobe.ng,www.thebluewardrobe.ng',
        'Update CORS_ALLOWED_ORIGINS=https://thebluewardrobe.ng,https://www.thebluewardrobe.ng,http://localhost:5173',
        'Update CSRF_TRUSTED_ORIGINS=https://thebluewardrobe.ng,https://www.thebluewardrobe.ng,https://thebluewardrobe-production.up.railway.app,https://*.up.railway.app'
      ],
      priority: 'HIGH'
    },
    {
      step: 3,
      title: 'Verify Domain Configuration',
      actions: [
        'Wait for DNS propagation (up to 24 hours)',
        'Test both thebluewardrobe.ng and www.thebluewardrobe.ng',
        'Check SSL certificate issuance',
        'Verify all functionality works'
      ],
      priority: 'MEDIUM'
    }
  ];
  
  console.log('Implementation Steps:');
  steps.forEach(step => {
    const icon = step.priority === 'HIGH' ? '🚨' : '⚠️';
    console.log(`\n${icon} Step ${step.step}: ${step.title}`);
    step.actions.forEach(action => {
      console.log(`   • ${action}`);
    });
  });
  
  return steps;
}

// Run all analyses
function runCompleteAnalysis() {
  console.log("=".repeat(80));
  console.log("COMPLETE CUSTOM DOMAIN SETUP ANALYSIS");
  console.log("=".repeat(80));
  
  const dnsRecords = analyzeDNSRecords();
  const railwayRecords = analyzeRailwayRecords();
  const issues = identifyIssues();
  const fixes = generateDNSFixes();
  const djangoSettings = checkDjangoSettings();
  const steps = generateImplementationSteps();
  
  console.log("\n" + "=".repeat(80));
  console.log("ANALYSIS COMPLETE");
  console.log("=".repeat(80));
  
  const criticalIssues = issues.filter(i => i.severity === 'HIGH').length;
  
  if (criticalIssues > 0) {
    console.log(`🚨 FOUND ${criticalIssues} CRITICAL ISSUES THAT NEED FIXING!`);
    console.log("\nIMMEDIATE ACTION REQUIRED:");
    console.log("1. Fix DNS records at HostAfrica");
    console.log("2. Update Railway environment variables");
    console.log("3. Wait for DNS propagation");
  } else {
    console.log("✅ Domain setup appears to be correct!");
  }
  
  return {
    dnsRecords,
    railwayRecords,
    issues,
    fixes,
    djangoSettings,
    steps
  };
}

// Run the complete analysis
runCompleteAnalysis();
