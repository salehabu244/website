# =====================================================================
# PieIt.net — static page builder
# Assembles _build/bodies/*.html into full pages using _build/template.html
# Run from the project root:  powershell -ExecutionPolicy Bypass -File _build/build.ps1
# =====================================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$buildDir = $PSScriptRoot
$template = Get-Content (Join-Path $buildDir 'template.html') -Raw -Encoding UTF8

function New-Schema($name, $desc) {
@"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "$name",
  "provider": {
    "@type": "Organization",
    "name": "PieIt.net",
    "url": "https://www.pieit.net/"
  },
  "areaServed": ["Bangladesh", "Worldwide"],
  "description": "$desc"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.pieit.net/index.html" },
    { "@type": "ListItem", "position": 2, "name": "$name", "item": "https://www.pieit.net/__FILE__" }
  ]
}
</script>
"@
}

$pages = @(
  @{ file='cloud-vps.html'; title='Cloud VPS & Virtual Machines in Bangladesh | BDIX Cloud Server | PieIt.net';
     desc='Deploy high-performance BDIX Cloud VPS and virtual machines in minutes. Tier-iii data center, 99.9% uptime, scalable resources and 24/7 premium support from PieIt.net.';
     keys='VPS Bangladesh, BDIX VPS, Cloud Server Bangladesh, Virtual Machine Bangladesh, VPS Hosting BD';
     og='Cloud VPS & Virtual Machines in Bangladesh';
     svc='Cloud VPS & Virtual Machines';
     svcdesc='High-performance BDIX-connected virtual servers with scalable resources, 99.9% uptime and 24/7 support.' },
  @{ file='email-solutions.html'; title='Business Email & Enterprise Mail Solutions in Bangladesh | PieIt.net';
     desc='Professional business email, dedicated mail servers, BDIX email hosting, mail hybrid and bulk email solutions for organizations in Bangladesh and worldwide.';
     keys='Business Email Bangladesh, Email Hosting Bangladesh, Dedicated Mail Server, BDIX Email Hosting, Bulk Email Bangladesh';
     og='Business Email & Enterprise Mail Solutions';
     svc='Business Email Solutions';
     svcdesc='Business email, dedicated mail servers, BDIX email hosting, mail hybrid and bulk email solutions.' },
  @{ file='domain-hosting.html'; title='Domain Registration & Corporate Hosting in Bangladesh | PieIt.net';
     desc='Reliable BDIX domain registration and corporate hosting with 99.99% uptime, fast performance, SSL and 24/7 premium support for businesses in Bangladesh.';
     keys='Domain Hosting Bangladesh, BDIX Hosting, Corporate Hosting Bangladesh, Domain Registration BD, SSL Certificate Bangladesh';
     og='Domain Registration & Corporate Hosting';
     svc='Domain & Hosting';
     svcdesc='BDIX corporate hosting, domain registration and SSL certificates with 99.99% uptime.' },
  @{ file='software-development.html'; title='Custom Software & ERP Development in Bangladesh | PieIt.net';
     desc='Custom ERP, enterprise software, CRM, HR & payroll, accounting, inventory and web/mobile app development built around your business processes.';
     keys='Custom Software Development Bangladesh, ERP Software Bangladesh, Custom ERP Bangladesh, Enterprise Software, CRM Development BD';
     og='Custom Software & ERP Development';
     svc='Custom Software & ERP Development';
     svcdesc='Custom ERP, enterprise software, CRM, HR & payroll, accounting, inventory and custom applications.' },
  @{ file='security.html'; title='Cybersecurity Solutions in Bangladesh | Email & Server Security | PieIt.net';
     desc='Protect your business with email anti-spam and security, server and infrastructure hardening, security monitoring, backup and disaster recovery and access control.';
     keys='Cybersecurity Solutions Bangladesh, Email Security BD, Server Security, Anti Spam Bangladesh, Backup Disaster Recovery';
     og='Cybersecurity Solutions for Business';
     svc='Cybersecurity Solutions';
     svcdesc='Email security, server hardening, monitoring, backup and disaster recovery and access control.' },
  @{ file='cloud-pabx.html'; title='Cloud PABX & Business Telephony in Bangladesh | PieIt.net';
     desc='Modern cloud PABX and dedicated PABX for business telephony, extension management, call routing and remote employee connectivity — no on-premise hardware required.';
     keys='Cloud PABX Bangladesh, Cloud PBX BD, Dedicated PABX, Business Telephony Bangladesh, IP PBX';
     og='Cloud PABX & Business Telephony';
     svc='Cloud PABX & Business Telephony';
     svcdesc='Cloud and dedicated PABX with extension management, call routing and remote connectivity.' },
  @{ file='about.html'; title='About PieIt.net | IT Infrastructure & Software Company in Bangladesh';
     desc='PieIt.net helps businesses build, operate and scale their technology — combining cloud infrastructure, hosting, email, security, communication and custom software.';
     keys='About PieIt.net, IT Company Bangladesh, Technology Partner Bangladesh, Cloud and Software Company';
     og='About PieIt.net';
     svc='IT Infrastructure & Software Solutions';
     svcdesc='Infrastructure, software and IT solutions for modern businesses.' },
  @{ file='contact.html'; title='Contact PieIt.net | Talk to an IT Expert in Bangladesh';
     desc='Contact PieIt.net for cloud VPS, business email, domain and hosting, custom ERP and software, cybersecurity and Cloud PABX. Request a quote or talk to an expert.';
     keys='Contact PieIt.net, IT Support Bangladesh, Request a Quote, Talk to an Expert, Cloud VPS Enquiry';
     og='Contact PieIt.net';
     svc='Contact & Sales';
     svcdesc='Talk to the PieIt.net team about cloud, software, security and communication solutions.' },
  @{ file='privacy.html'; title='Privacy Policy | PieIt.net';
     desc='How PieIt.net collects, uses and protects the information you share with us.';
     keys='Privacy Policy PieIt.net';
     og='Privacy Policy | PieIt.net';
     svc='Privacy Policy';
     svcdesc='How PieIt.net collects, uses and protects your information.' },
  @{ file='terms.html'; title='Terms of Service | PieIt.net';
     desc='The terms that govern your use of PieIt.net services and website.';
     keys='Terms of Service PieIt.net';
     og='Terms of Service | PieIt.net';
     svc='Terms of Service';
     svcdesc='The terms that govern your use of PieIt.net services and website.' }
)

$count = 0
foreach ($p in $pages) {
  $bodyPath = Join-Path $buildDir ("bodies\" + $p.file)
  if (-not (Test-Path $bodyPath)) { Write-Warning "Missing body: $bodyPath"; continue }
  $body = Get-Content $bodyPath -Raw -Encoding UTF8

  $html = $template
  $html = $html.Replace('{{TITLE}}',    $p.title)
  $html = $html.Replace('{{DESC}}',     $p.desc)
  $html = $html.Replace('{{KEYWORDS}}', $p.keys)
  $html = $html.Replace('{{CANON}}',    ('https://www.pieit.net/' + $p.file))
  $html = $html.Replace('{{OGTITLE}}',  $p.og)
  $html = $html.Replace('{{OGDESC}}',   $p.desc)
  $schema = (New-Schema $p.svc $p.svcdesc).Replace('__FILE__', $p.file)
  $html = $html.Replace('{{SCHEMA}}',   $schema)
  $html = $html.Replace('{{BODY}}',     $body)

  # mark the active nav item
  $needle = '<a class="nav-link" href="' + $p.file + '"'
  $html = $html.Replace($needle, ($needle + ' aria-current="page"'))

  $out = Join-Path $root $p.file
  [System.IO.File]::WriteAllText($out, $html, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ("Built: " + $p.file)
  $count++
}
Write-Host ""
Write-Host "$count page(s) built into $root"
