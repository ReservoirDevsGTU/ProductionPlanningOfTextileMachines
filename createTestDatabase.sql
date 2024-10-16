CREATE DATABASE TestDatabase

USE TestDatabase

CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    UserName VARCHAR,
    Name VARCHAR,
    Surname VARCHAR,
    UserEmail VARCHAR,
    UserStatus INT
);

CREATE TABLE PurchaseRequests (
    RequestID INT PRIMARY KEY,
    RequestDeadline DATE,
    RequestedBy INT,
    CreatedBy INT,
    CreationDate DATETIME,
    RequestStatus INT,
    IsDeleted INT
    FOREIGN KEY (RequestedBy) REFERENCES Users(userID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(userID),
);

CREATE TABLE PurchaseRequestDetails (
    RequestDetailID INT PRIMARY KEY,
    RequestID INT,
    MaterialID INT,
    RequestedAmount DECIMAL,
    OfferedAmount DECIMAL,
    OrderedAmount DECIMAL,
    ProvidedAmount DECIMAL,
    MaterialStatus INT,
    IsDeleted INT,
    FOREIGN KEY (RequestID) REFERENCES PurchaseRequests
);

CREATE TABLE Materials (
    MaterialID INT PRIMARY KEY,
    MaterialName VARCHAR,
    MaterialStatus INT,
    IsDeleted INT, 
);

ALTER TABLE Users
ALTER COLUMN UserName VARCHAR(100);

ALTER TABLE Users
ALTER COLUMN Name VARCHAR(100);

ALTER TABLE Users
ALTER COLUMN Surname VARCHAR(100);

ALTER TABLE Users
ALTER COLUMN UserEmail VARCHAR(100);

ALTER TABLE Materials
ALTER COLUMN MaterialName VARCHAR(100);


INSERT INTO Users (UserID, UserName, Name, Surname, UserEmail, UserStatus) VALUES (1, 'baransahin', 'Baran', 'Sahin', 'baran.sahin@mail.com', 1);

INSERT INTO PurchaseRequests (RequestID, RequestDeadline, RequestedBy, CreatedBy, CreationDate, RequestStatus, IsDeleted) VALUES (1, '2024-10-20', 1, 1, '2024-10-16 14:30:00', 1, 0);

INSERT INTO PurchaseRequestDetails (RequestDetailID, RequestID, MaterialID, RequestedAmount, OfferedAmount, OrderedAmount, ProvidedAmount, MaterialStatus, IsDeleted) VALUES (1, 1, 1, 10, 0, 0, 0, 1, 0);
INSERT INTO PurchaseRequestDetails (RequestDetailID, RequestID, MaterialID, RequestedAmount, OfferedAmount, OrderedAmount, ProvidedAmount, MaterialStatus, IsDeleted) VALUES (2, 1, 2, 2, 2, 2, 1, 1, 0);
INSERT INTO PurchaseRequestDetails (RequestDetailID, RequestID, MaterialID, RequestedAmount, OfferedAmount, OrderedAmount, ProvidedAmount, MaterialStatus, IsDeleted) VALUES (3, 1, 3, 5, 3, 3, 3, 1, 0);

INSERT INTO Materials (MaterialID, MaterialName, MaterialStatus, IsDeleted) VALUES (1, 'kitap', 1, 0);
INSERT INTO Materials (MaterialID, MaterialName, MaterialStatus, IsDeleted) VALUES (2, 'klavye', 1, 0);
INSERT INTO Materials (MaterialID, MaterialName, MaterialStatus, IsDeleted) VALUES (3, 'lamba', 1, 0);

SELECT * FROM Users;

SELECT * FROM PurchaseRequests;

SELECT * FROM PurchaseRequestDetails;

SELECT * FROM Materials;