-- Campus Clinic Inventory and Patient Records System
-- Database Schema for MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE IF NOT EXISTS `medicines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'General',
  `stock` int(11) NOT NULL DEFAULT 0,
  `expirationDate` date DEFAULT NULL,
  `dateAdded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`name`, `category`, `stock`, `expirationDate`) VALUES
('Paracetamol 500mg', 'Painkiller', 150, '2026-12-31'),
('Amoxicillin 250mg', 'Antibiotic', 85, '2025-06-15'),
('Cetirizine 10mg', 'Antihistamine', 120, '2026-03-20'),
('Ibuprofen 400mg', 'Painkiller', 60, '2025-11-10'),
('Mefenamic Acid', 'Analgesic', 45, '2025-08-05');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE IF NOT EXISTS `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `complaint` text DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `dateVisit` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`fullname`, `age`, `gender`, `department`, `complaint`, `diagnosis`) VALUES
('John Student Doe', 20, 'Male', 'Engineering Department', 'Headache and minor fever', 'General Fatigue'),
('Jane Smith', 19, 'Female', 'Information Technology Department', 'Stomach ache', 'Hyperacidity'),
('Michael Brown', 21, 'Male', 'Education Department', 'Sprained ankle during sports', 'Minor Sprain');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` int(11) NOT NULL,
  `medicineId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `issuedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`patientId`, `medicineId`, `quantity`) VALUES
(1, 1, 2),
(2, 5, 1),
(3, 4, 3);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'Staff',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `fullname`, `role`) VALUES
('admin@clinic.edu', 'Primary Campus Nurse', 'Admin');
