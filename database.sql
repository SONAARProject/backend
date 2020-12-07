drop database sonaar;

create database sonaar
default charset "UTF8";

use sonaar;

DROP TABLE IF EXISTS `Image`;
CREATE TABLE `Image`
(
  `ImageId` int
(11) NOT NULL AUTO_INCREMENT,
  `ClarifaiId` varchar
(255) NOT NULL,
`ClarifaiConcepts` mediumtext NOT NULL,
  `CreationDate` datetime NOT NULL,
  PRIMARY KEY
(`ImageId`),
UNIQUE KEY `ImageId_UNIQUE`
(`ImageId`),
UNIQUE KEY `ClarifaiId_UNIQUE`
(`ClarifaiId`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `AltText`;
CREATE TABLE `AltText`
(
  `AltTextId` int
(11) NOT NULL AUTO_INCREMENT,
  `ImageId` int
(11) NOT NULL,
  `AltText` mediumtext NOT NULL,
  `Keywords` mediumtext NOT NULL,
  `CreationDate` datetime NOT NULL,
  PRIMARY KEY
(`AltTextId`),
UNIQUE KEY `AltTextId_UNIQUE`
(`AltTextId`),
KEY `ATImageId_fk`
(`ImageId`),
  CONSTRAINT `ATImageId_fk` FOREIGN KEY
(`ImageId`) REFERENCES `Image`
(`ImageId`) ON
DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8;