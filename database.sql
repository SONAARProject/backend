drop database sonaar;

create database sonaar
default charset "UTF8";

use sonaar;

DROP TABLE IF EXISTS `Image`;
CREATE TABLE `Image` (
  `ImageId` INT (11) NOT NULL AUTO_INCREMENT,
  `ClarifaiId` VARCHAR (255) NOT NULL,
  `ClarifaiConcepts` TEXT NOT NULL,
  `Text` TEXT,
  `CreationDate` DATETIME NOT NULL,
  PRIMARY KEY (`ImageId`),
  UNIQUE KEY `ImageId_UNIQUE` (`ImageId`),
  UNIQUE KEY `ClarifaiId_UNIQUE` (`ClarifaiId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `AltText`;
CREATE TABLE `AltText` (
  `AltTextId` INT (11) NOT NULL AUTO_INCREMENT,
  `ImageId` INT (11) NOT NULL,
  `AltText` TEXT NOT NULL,
  `Keywords` TEXT NOT NULL,
  `Language` VARCHAR(10) NOT NULL,
  `Counter` INT (11) DEFAULT 1,
  `CreationDate` DATETIME NOT NULL,
  PRIMARY KEY (`AltTextId`),
  UNIQUE KEY `AltTextId_UNIQUE` (`AltTextId`),
  KEY `ATImageId_fk` (`ImageId`),
  CONSTRAINT `ATImageId_fk` FOREIGN KEY (`ImageId`) REFERENCES `Image` (`ImageId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `Counter`;
CREATE TABLE `Counter` (
  `Authoring` INT (11) DEFAULT 0,
  `Consumption` INT (11) DEFAULT 0,
  `AuthoringLastUpdated` DATETIME NOT NULL,
  `ConsumptionLastUpdated` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;