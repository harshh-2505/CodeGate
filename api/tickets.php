<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['userId'])) {
        $userId = $_GET['userId'];
        $stmt = $conn->prepare("
            SELECT t.*, 
                   e.name, e.date, e.time, e.location, e.price, e.organizerId, e.image, e.tags,
                   u.name as organizerName
            FROM tickets t 
            JOIN events e ON t.eventId = e.id
            JOIN users u ON e.organizerId = u.id
            WHERE t.ownerId = ?
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $tickets = [];
        while ($row = $result->fetch_assoc()) {
            // Re-structure to match the frontend's expected format
            $tickets[] = [
                'id' => $row['id'],
                'eventId' => $row['eventId'],
                'ownerId' => $row['ownerId'],
                'purchaseDate' => $row['purchaseDate'],
                'isForResale' => (bool)$row['isForResale'],
                'resalePrice' => $row['resalePrice'],
                'eventDetails' => [
                    'id' => $row['eventId'],
                    'name' => $row['name'],
                    'date' => $row['date'],
                    'time' => $row['time'],
                    'location' => $row['location'],
                    'price' => $row['price'],
                    'organizerId' => $row['organizerId'],
                    'organizerName' => $row['organizerName'],
                    'image' => $row['image'],
                    'tags' => json_decode($row['tags']),
                ]
            ];
        }
        echo json_encode($tickets);
        $stmt->close();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $eventId = $data['eventId'];
    $ownerId = $data['ownerId'];

    $stmt = $conn->prepare("INSERT INTO tickets (eventId, ownerId) VALUES (?, ?)");
    $stmt->bind_param("ii", $eventId, $ownerId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Ticket purchased successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
    }
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $ticketId = $data['ticketId'];
    $isForResale = $data['isForResale'];
    $resalePrice = $data['resalePrice'] ?? null;

    $stmt = $conn->prepare("UPDATE tickets SET isForResale = ?, resalePrice = ? WHERE id = ?");
    $stmt->bind_param("idi", $isForResale, $resalePrice, $ticketId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Ticket resale status updated.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>
