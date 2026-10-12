<?php
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$type = $data['type'];

// Check if user already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();


$stmt = $conn->prepare("INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $password, $type);

if ($stmt->execute()) {
    $last_id = $stmt->insert_id;
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $last_id,
            'name' => $name,
            'email' => $email,
            'type' => $type
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
