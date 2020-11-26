create database sonaar
default charset "UTF8";

DROP TABLE IF EXISTS `Images`;
CREATE TABLE `Images`
(
  `ImageId` int
(11) NOT NULL AUTO_INCREMENT,
  `ClarifaiId` varchar
(255) NOT NULL,
  `Alt` mediumtext NOT NULL,
  `CreationDate` datetime NOT NULL,
  PRIMARY KEY
(`ImageId`),
UNIQUE KEY `ImageId_UNIQUE`
(`ImageId`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8;
