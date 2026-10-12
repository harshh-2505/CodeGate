<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT e.*, u.name as organizerName FROM events e JOIN users u ON e.organizerId = u.id ORDER BY e.date ASC";
    $result = $conn->query($sql);
    $events = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Decode JSON string for tags
            $row['tags'] = json_decode($row['tags']);
            $events[] = $row;
        }
    }
    echo json_encode($events);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $name = $data['name'];
    $date = $data['date'];
    $time = $data['time'];
    $location = $data['location'];
    $description = $data['description'];
    $price = $data['price'];
    $organizerId = $data['organizerId'];
    $image = $data['image'];
    $tags = json_encode($data['tags']);
    $isFeatured = $data['isFeatured'] ?? 0;

    $stmt = $conn->prepare("INSERT INTO events (name, date, time, location, description, price, organizerId, image, tags, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssdssi", $name, $date, $time, $location, $description, $price, $organizerId, $image, $tags, $isFeatured);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Event created successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>
