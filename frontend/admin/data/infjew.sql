/*
 Navicat Premium Dump SQL

 Source Server         : INFJEW-docker
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : 108.61.194.156:3306
 Source Schema         : infjew

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 07/02/2026 11:59:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` enum('admin','superadmin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for banner
-- ----------------------------
DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `picurl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for countingDown
-- ----------------------------
DROP TABLE IF EXISTS `countingDown`;
CREATE TABLE `countingDown`  (
  `id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` int NOT NULL,
  `discount` int NOT NULL,
  `percentage` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `rating` int NOT NULL,
  `ddl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `picurl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id` DESC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for order
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `precious_id` int NOT NULL,
  `order_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `order_create_date` datetime NOT NULL,
  `order_delivery_start_date` datetime NULL DEFAULT NULL,
  `order_delivery_arrival_date` datetime NULL DEFAULT NULL,
  `order_delivery_trackid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `order_delivery_status` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for preciousInfo
-- ----------------------------
DROP TABLE IF EXISTS `preciousInfo`;
CREATE TABLE `preciousInfo`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `precious_id` int NOT NULL,
  `precious_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `precious_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `precious_pictures` json NULL,
  `precious_materials` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `precious_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `precious_tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `precious_desc` json NULL,
  `precious_official_price` decimal(10, 2) NULL DEFAULT NULL,
  `precious_info_filled` tinyint(1) GENERATED ALWAYS AS (if(((`precious_id` > 0) and (trim(ifnull(`precious_code`,_utf8mb4'')) <> _utf8mb4'') and (trim(ifnull(`precious_name`,_utf8mb4'')) <> _utf8mb4'') and (`precious_pictures` is not null) and (json_type(`precious_pictures`) = _utf8mb4'ARRAY') and (json_length(`precious_pictures`) > 0) and (trim(ifnull(`precious_materials`,_utf8mb4'')) <> _utf8mb4'') and (trim(ifnull(`precious_type`,_utf8mb4'')) <> _utf8mb4'') and (trim(ifnull(`precious_tag`,_utf8mb4'')) <> _utf8mb4'') and (`precious_desc` is not null) and (json_length(`precious_desc`) > 0) and (ifnull(`precious_official_price`,0) > 0)),1,0)) STORED NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for preciousList
-- ----------------------------
DROP TABLE IF EXISTS `preciousList`;
CREATE TABLE `preciousList`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `itemid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tag` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` int NOT NULL,
  `discount` int NOT NULL,
  `rating` decimal(2, 1) NOT NULL,
  `status` int NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `picurl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_preciouslist_rating_half_step` CHECK ((`rating` >= 0.0) and (`rating` <= 5.0) and ((`rating` * 2) = floor((`rating` * 2))))
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for preciousTags
-- ----------------------------
DROP TABLE IF EXISTS `preciousTags`;
CREATE TABLE `preciousTags`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `tags` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for preciousTypes
-- ----------------------------
DROP TABLE IF EXISTS `preciousTypes`;
CREATE TABLE `preciousTypes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `types` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Triggers structure for table banner
-- ----------------------------
DROP TRIGGER IF EXISTS `limit_banner_rows`;
delimiter ;;
CREATE TRIGGER `limit_banner_rows` BEFORE INSERT ON `banner` FOR EACH ROW BEGIN
    DECLARE total_rows INT;
    SELECT COUNT(*) INTO total_rows FROM banner;
    IF total_rows >= 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'banner 表最多只能有 3 条记录。';
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table countingDown
-- ----------------------------
DROP TRIGGER IF EXISTS `limit_countingdown_rows`;
delimiter ;;
CREATE TRIGGER `limit_countingdown_rows` BEFORE INSERT ON `countingDown` FOR EACH ROW BEGIN
    DECLARE total_rows INT;
    SELECT COUNT(*) INTO total_rows FROM countingdown;
    IF total_rows >= 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'banner 表最多只能有 1 条记录。';
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
