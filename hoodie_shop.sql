-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Cze 20, 2025 at 04:47 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hoodie_shop`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `orderitems`
--

CREATE TABLE `orderitems` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `size` enum('S','M','L','XL') DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`id`, `orderId`, `productId`, `size`, `quantity`, `price`) VALUES
(1, 58, 8, 'M', 1, 249.99),
(2, 58, 10, 'M', 1, 229.99),
(3, 59, 9, 'S', 1, 89.99),
(4, 59, 8, 'L', 1, 249.99),
(5, 59, 10, 'M', 1, 229.99),
(6, 60, 8, 'M', 1, 249.99),
(7, 61, 8, 'L', 1, 249.99),
(8, 62, 11, 'L', 1, 269.99);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `contactName` varchar(255) DEFAULT NULL,
  `contactEmail` varchar(255) DEFAULT NULL,
  `contactPhone` varchar(50) DEFAULT NULL,
  `shipType` enum('pickup','delivery') DEFAULT NULL,
  `shipLocationId` int(11) DEFAULT NULL,
  `shipAddress` varchar(500) DEFAULT NULL,
  `shipLat` double DEFAULT NULL,
  `shipLng` double DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','paid') DEFAULT 'pending',
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `userId`, `contactName`, `contactEmail`, `contactPhone`, `shipType`, `shipLocationId`, `shipAddress`, `shipLat`, `shipLng`, `total`, `status`, `createdAt`) VALUES
(58, 6, 'Jan Paluszkiewicz', 'jan.paluszkiewicz.84@gmail.com', '111222333', 'pickup', 4, NULL, NULL, NULL, 479.98, 'paid', '2025-06-20 15:50:50'),
(59, 7, 'Jan Paluszkiewicz', 'jan.paluszkiewicz.84@gmail.com', '111222333', 'delivery', NULL, 'ul. Fajna 61-111', NULL, NULL, 569.97, 'paid', '2025-06-20 15:57:51'),
(60, NULL, 'Jan Paluszkiewicz', 'jan.paluszkiewicz.84@gmail.com', '111222333', 'pickup', 17, NULL, NULL, NULL, 249.99, 'paid', '2025-06-20 16:18:34'),
(61, 7, 'Jan Paluszkiewicz', 'jan.paluszkiewicz.84@gmail.com', '111222333', 'pickup', 4, NULL, NULL, NULL, 249.99, 'paid', '2025-06-20 16:23:51'),
(62, 8, 'Jan Paluszkiewicz', 'jan.paluszkiewicz.84@gmail.com', '111222333', 'pickup', 5, NULL, NULL, NULL, 269.99, 'paid', '2025-06-20 16:41:15');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `passwordresettokens`
--

CREATE TABLE `passwordresettokens` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `token` varchar(128) NOT NULL,
  `expiresAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `pickuplocations`
--

CREATE TABLE `pickuplocations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pickuplocations`
--

INSERT INTO `pickuplocations` (`id`, `name`, `lat`, `lng`) VALUES
(1, 'Paczkomat Warszawa - Centrum', 52.22977, 21.01178),
(2, 'Paczkomat Warszawa - Wola', 52.23009, 20.98734),
(3, 'Paczkomat Warszawa - Praga Północ', 52.25521, 21.00317),
(4, 'Paczkomat Poznań – Stary Rynek', 52.40842, 16.93423),
(5, 'Paczkomat Poznań – Dworzec Główny', 52.39962, 16.91936),
(6, 'Paczkomat Poznań – Malta', 52.40686, 16.9874),
(7, 'Paczkomat Poznań – Ogrody', 52.4028, 16.8343),
(8, 'Paczkomat Poznań – Łazarz', 52.4081, 16.8765),
(9, 'Paczkomat Warszawa – Centrum', 52.22977, 21.01178),
(10, 'Paczkomat Warszawa – Wola', 52.2401, 20.98203),
(11, 'Paczkomat Kraków – Rynek Główny', 50.06143, 19.93658),
(12, 'Paczkomat Kraków – Nowa Huta', 50.0784, 19.96373),
(13, 'Paczkomat Wrocław – Rynek', 51.10788, 17.03854),
(14, 'Paczkomat Wrocław – Leśnica', 51.09795, 16.88117),
(15, 'Paczkomat Gdańsk – Długie Pobrzeże', 54.35205, 18.64659),
(16, 'Paczkomat Gdańsk – Oliwa', 54.40205, 18.62718),
(17, 'Paczkomat Poznań – Stary Rynek', 52.40637, 16.92517),
(18, 'Paczkomat Poznań – Wilda', 52.38923, 16.92965),
(19, 'Paczkomat Lublin – Stare Miasto', 51.24645, 22.56844),
(20, 'Paczkomat Szczecin – Centrum', 53.42854, 14.55281),
(21, 'Paczkomat Białystok – Rynek', 53.13249, 23.16884),
(22, 'Paczkomat Rzeszów – Aleja Lubomirskich', 50.04132, 21.99901),
(23, 'Paczkomat Katowice – Silesia City Center', 50.25948, 19.0216),
(24, 'Paczkomat Łódź – Manufaktura', 51.77647, 19.45401),
(25, 'Paczkomat Poznań – Rataje', 52.39557, 16.94524),
(26, 'Paczkomat Poznań – Jeżyce', 52.42486, 16.90552),
(27, 'Paczkomat Poznań – Winogrady', 52.42134, 16.95455),
(28, 'Paczkomat Poznań – Ławica', 52.42366, 16.82573),
(29, 'Paczkomat Poznań – Piątkowo', 52.47802, 16.88074),
(30, 'Paczkomat Poznań – Grunwald', 52.39321, 16.89312),
(31, 'Paczkomat Poznań – Naramowice', 52.45312, 16.93998);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('bluza','koszulka') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `imageUrl`, `deletedAt`) VALUES
(8, 'Bluza GymDog', 'Bluza „Gym Dog”\r\n\r\nMateriał: 80 % bawełna ring-spun, 20 % poliester, gramatura 320 g/m²\r\n\r\nKrój: unisex, klasyczny z kieszenią kangurka\r\n\r\nDetale: kaptur z regulowanym sznurkiem, ściągacze na mankietach i u dołu\r\n\r\nWzór: przód – pies trzymający w pysku hantlę, tył – pies siedzący tyłem\r\n\r\nDruk: trwały sitodruk w dwóch odcieniach ciemnego grafitu\r\n\r\nWykończenie: miękka, szczotkowana podszewka, odporność na spieranie', 'bluza', 249.99, '/uploads/c111ccdbcaa6e5fa3dd7964a129b10a7', NULL),
(9, 'Koszulka HamsterLift', 'Koszulka „Hamster Lift”\r\n\r\nMateriał: 100 % bawełna ring-spun, gramatura 180 g/m²\r\n\r\nKrój: unisex regular fit, okrągły dekolt\r\n\r\nWzór: przód – chomik trzymający hantelkę, tył – muskularny chomik unoszący sztangę\r\n\r\nStyl: minimalistyczny, retro linia w dwóch kontrastowych odcieniach\r\n\r\nZalety: oddychająca, lekka, trwały druk – idealna na trening i do codziennych stylówek', 'koszulka', 89.99, '/uploads/fcb3f80270dfdd32762269b94ccfd942', NULL),
(10, 'Bluza ProteinChick', 'Bluza „Protein Chick”\r\n\r\nMateriał: 80 % bawełna ring-spun, 20 % poliester, gramatura 320 g/m²\r\n\r\nKrój: unisex, klasyczny, kieszeń kangurka\r\n\r\nDetale: kaptur z regulowanym sznurkiem, ściągacze na mankietach i u dołu\r\n\r\nWzór: przód – mały kurczaczek z słoikiem odżywki, tył – umięśniony kogut unoszący sztangę\r\n\r\nWykończenie: miękki meszek od wewnątrz, trwały sitodruk', 'bluza', 229.99, '/uploads/ad73c0a3ee427a841bf91db495c22fd0', NULL),
(11, 'Bluza Trust the Process', 'Bluza „Trust the Process”\r\n\r\nMateriał: 80 % bawełna ring-spun, 20 % poliester, 320 g/m²\r\n\r\nKrój: unisex, klasyczny, z kapturem i kieszenią kangurka\r\n\r\nDetale: ściągacze na mankietach i u dołu, regulowany sznurek w kapturze\r\n\r\nWzór:\r\n\r\nPrzód: trzy szczury zebrane wokół sztangi\r\n\r\nTył: muskularny szczur w ramce obok mniejszego szczura oraz duży napis „TRUST THE PROCESS”\r\n\r\nDruk: dwukolorowy sitodruk w odcieniach grafitu\r\n\r\nWykończenie: miękka szczotkowana podszewka, odporna na mechaceni', 'bluza', 269.99, '/uploads/7866fd480cae31f19b4d3dc3251f97e3', NULL),
(12, 'test', 'Test.', 'koszulka', 1.00, NULL, '2025-06-20 16:44:14');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `text` text DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `productId`, `userId`, `rating`, `text`, `imageUrl`, `createdAt`) VALUES
(11, 8, 6, 4, 'Bardzo wygodna bluza', '/uploads/9b1593595ad2f0a5987f8637953df801', '2025-06-20 15:51:51'),
(12, 10, 6, 3, 'Bluza była lekko ubrudzona ', '/uploads/9c4020c765a607f75fef9c41eb7cfd1f', '2025-06-20 15:55:50'),
(13, 8, 7, 5, 'Najlepszy produkt na stronie.', NULL, '2025-06-20 15:58:51'),
(14, 10, 7, 4, 'Bez większych zarzutów', NULL, '2025-06-20 15:59:35');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `size` enum('S','M','L','XL') NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`id`, `productId`, `size`, `quantity`) VALUES
(17, 8, 'S', 25),
(18, 8, 'M', 23),
(19, 8, 'L', 23),
(20, 8, 'XL', 25),
(21, 9, 'S', 9),
(22, 9, 'M', 10),
(23, 9, 'L', 10),
(24, 9, 'XL', 10),
(25, 10, 'S', 10),
(26, 10, 'M', 8),
(27, 10, 'L', 10),
(28, 10, 'XL', 0),
(29, 11, 'S', 3),
(30, 11, 'M', 3),
(31, 11, 'L', 2),
(32, 11, 'XL', 3),
(37, 12, 'S', 0),
(38, 12, 'M', 0),
(39, 12, 'L', 0),
(40, 12, 'XL', 0);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`) VALUES
(4, 'admin@ex.com', '$2b$10$bN6gQzuUz9DejhmJYGaopOAlTfThBSOZwEVUgFGbCkacf2oP2ZSdi', 'admin'),
(6, 'klient1@ex.com', '$2b$10$rlJ44XMQc8h.flWQG1ARJO7rXokf3MQuj7/wDvM3meifu8Qv1RK86', 'user'),
(7, 'klient2@ex.com', '$2b$10$29PWySXMMlDL3UUgHq9Q5Ouxlo5/djORvn168/NeMkA0NfZfoWMpy', 'user'),
(8, 'jan.paluszkiewicz.84@gmail.com', '$2b$10$T7D02GyYvsKzMxyiJgAQjuo63pMp/W.btQBMIUX8om2nAuo/hiPd6', 'user');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `productId` (`productId`);

--
-- Indeksy dla tabeli `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeksy dla tabeli `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeksy dla tabeli `pickuplocations`
--
ALTER TABLE `pickuplocations`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_deletedAt` (`deletedAt`);

--
-- Indeksy dla tabeli `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `productId` (`productId`),
  ADD KEY `userId` (`userId`);
ALTER TABLE `reviews` ADD FULLTEXT KEY `text` (`text`);
ALTER TABLE `reviews` ADD FULLTEXT KEY `idx_ft_text` (`text`);

--
-- Indeksy dla tabeli `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `productId` (`productId`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `passwordresettokens`
--
ALTER TABLE `passwordresettokens`
  ADD CONSTRAINT `passwordresettokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
