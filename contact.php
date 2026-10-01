<?php
/**
 * PieIt.net — Contact form handler
 * Receives the enquiry form and emails it to the sales inbox.
 *
 * CONFIGURE: set the recipient addresses below before going live.
 * If your host does not support PHP mail(), swap in an SMTP library
 * (e.g. PHPMailer) — the rest of the site needs no changes.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ----------------------- CONFIG ----------------------- */
$TO_SALES     = 'info@pieit.net';        // main recipient
$CC           = '';                       // optional comma separated
$FROM_DOMAIN  = 'pieit.net';              // used to build a valid From address
$SUBJECT_TAG  = '[PieIt.net] New Website Enquiry';
/* ------------------------------------------------------ */

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* AJAX-only guard (simple origin check) */
$isAjax = (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest');

/* Honeypot */
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true, 'message' => 'Thank you.']); // silently drop bots
    exit;
}

/* Basic rate limiting per session */
session_start();
$now = time();
$stamps = $_SESSION['pieit_form_hits'] ?? [];
$stamps = array_values(array_filter($stamps, function ($t) use ($now) { return ($now - $t) < 300; }));
if (count($stamps) >= 5) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'message' => 'Too many requests. Please try again in a few minutes.']);
    exit;
}
$stamps[] = $now;
$_SESSION['pieit_form_hits'] = $stamps;

function clean($key, $max = 2000) {
    $v = trim((string)($_POST[$key] ?? ''));
    $v = strip_tags($v);
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v);
    if (function_exists('mb_substr')) { $v = mb_substr($v, 0, $max); }
    else { $v = substr($v, 0, $max); }
    return $v;
}

/* Message keeps line breaks */
$messageRaw = strip_tags(trim((string)($_POST['message'] ?? '')));
if (function_exists('mb_substr')) { $messageRaw = mb_substr($messageRaw, 0, 5000); }

$data = [
    'name'        => clean('name', 120),
    'company'     => clean('company', 160),
    'email'       => clean('email', 160),
    'phone'       => clean('phone', 40),
    'service'     => clean('service', 80),
    'requirement' => clean('requirement', 2000),
    'budget'      => clean('budget', 80),
    'message'     => $messageRaw,
];

$errors = [];
if ($data['name'] === '')  { $errors[] = 'Name is required.'; }
if ($data['email'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($data['message'] === '' || strlen($data['message']) < 10) {
    $errors[] = 'Please include a short message.';
}
/* Header-injection defence */
foreach (['name', 'company', 'email', 'phone', 'service', 'budget'] as $f) {
    if (preg_match('/[\r\n]/', $_POST[$f] ?? '')) { $errors[] = 'Invalid input detected.'; break; }
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => implode(' ', $errors)]);
    exit;
}

$safeName = $data['name'];
$subject  = $SUBJECT_TAG . ' — ' . ($data['service'] !== '' ? $data['service'] : 'General') . ' (' . $safeName . ')';

$rows = [
    'Name'                => $data['name'],
    'Company'             => $data['company'],
    'Email'               => $data['email'],
    'Phone'               => $data['phone'],
    'Service Interested'  => $data['service'],
    'Budget Range'        => $data['budget'],
    'Requirement'         => $data['requirement'],
];

$html  = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">';
$html .= '<div style="background:linear-gradient(120deg,#0b3b6f,#1657a6);color:#fff;padding:20px 24px">';
$html .= '<h2 style="margin:0;font-size:18px">New Website Enquiry — PieIt.net</h2></div>';
$html .= '<div style="padding:22px 24px">';
$html .= '<table style="width:100%;border-collapse:collapse;font-size:14px">';
foreach ($rows as $label => $val) {
    if ($val === '') continue;
    $html .= '<tr><td style="padding:8px 10px;background:#f7fafc;font-weight:bold;color:#0a1b2e;width:170px;border-bottom:1px solid #eef2f7">'
          . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</td>'
          . '<td style="padding:8px 10px;border-bottom:1px solid #eef2f7">'
          . nl2br(htmlspecialchars($val, ENT_QUOTES, 'UTF-8')) . '</td></tr>';
}
$html .= '</table>';
$html .= '<p style="font-size:13px;color:#64748b;margin-top:18px">Sent from the PieIt.net website contact form.</p>';
$html .= '</div></div>';

$from = 'no-reply@' . $FROM_DOMAIN;
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: PieIt.net Website <{$from}>\r\n";
if (filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: {$data['name']} <{$data['email']}>\r\n";
}
if ($CC !== '') { $headers .= "Cc: {$CC}\r\n"; }
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($TO_SALES, $subject, $html, $headers);

if ($sent) {
    echo json_encode([
        'ok' => true,
        'message' => 'Thank you, ' . htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8') .
                     '! Your request has been sent. Our team will get back to you shortly.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Sorry, the message could not be sent right now. Please email info@pieit.net directly.'
    ]);
}
