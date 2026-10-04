CREATE DATABASE foodbridge;

USE foodbridge;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50),
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donorName VARCHAR(100),
    foodType VARCHAR(255),
    quantity VARCHAR(100),
    location VARCHAR(255),
    availableFrom DATETIME,
    availableTo DATETIME,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    requestedBy VARCHAR(100),
    volunteer VARCHAR(100)
);