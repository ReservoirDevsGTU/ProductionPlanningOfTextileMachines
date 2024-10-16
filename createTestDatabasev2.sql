CREATE DATABASE TestDatabase;

GO

USE TestDatabase;

CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    UserName VARCHAR(100),
    Name VARCHAR(100),
    Surname VARCHAR(100),
    UserEmail VARCHAR(100),
    UserStatus INT
);

CREATE TABLE PurchaseRequests (
    RequestID INT PRIMARY KEY,
    RequestDeadline DATE,
    RequestedBy INT,
    CreatedBy INT,
    CreationDate DATETIME,
    RequestStatus INT,
    IsDeleted INT,
    FOREIGN KEY (RequestedBy) REFERENCES Users(UserID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseRequestInfos (
    RequestInfoID INT PRIMARY KEY,
    RequestID INT,
    RequestDescription VARCHAR(255),
    ManufacturingUnitID INT,
    RequestInfoStatus INT,
    IsDeleted INT,
    FOREIGN KEY (RequestID) REFERENCES PurchaseRequests(RequestID)
);

CREATE TABLE MaterialTypes (
    MaterialTypeID INT PRIMARY KEY,
    MaterialTypeName VARCHAR(100),
    MaterialTypeStatus INT,
    IsDeleted INT
);

CREATE TABLE Warehouses (
    WarehouseID INT PRIMARY KEY,
    WarehouseName VARCHAR(100),
    WarehouseAddress VARCHAR(255),
    WarehouseSupervisorID INT,
    WarehouseStatus INT,
    IsDeleted INT,
    FOREIGN KEY (WarehouseSupervisorID) REFERENCES Users(UserID)
);

CREATE TABLE Materials (
    MaterialID INT PRIMARY KEY,
    MaterialName VARCHAR(100),
    MaterialStatus INT,
    IsDeleted INT
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
    FOREIGN KEY (RequestID) REFERENCES PurchaseRequests(RequestID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

CREATE TABLE MaterialSpecs (
    MaterialSpecID INT PRIMARY KEY,
    MaterialID INT,
    MainMaterialID INT,
    SuckerNo VARCHAR(50),
    MaterialNo VARCHAR(50),
    PhotoNo VARCHAR(50),
    MaterialTypeID INT,
    UnitID INT,
    IsDeleted INT,
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID),
    FOREIGN KEY (MaterialTypeID) REFERENCES MaterialTypes(MaterialTypeID)
);

CREATE TABLE MaterialInventory (
    InventoryID INT PRIMARY KEY,
    MaterialID INT,
    WarehouseID INT,
    Quantity DECIMAL(18, 2),
    LastUpdated DATETIME,
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);


INSERT INTO Users (UserID, UserName, Name, Surname, UserEmail, UserStatus) 
VALUES (1, 'baransahin', 'Baran', 'Sahin', 'baran.sahin@mail.com', 1);

INSERT INTO PurchaseRequests (RequestID, RequestDeadline, RequestedBy, CreatedBy, CreationDate, RequestStatus, IsDeleted) 
VALUES (1, '2024-10-20', 1, 1, '2024-10-16 14:30:00', 1, 0);

INSERT INTO PurchaseRequestInfos (RequestInfoID, RequestID, RequestDescription, ManufacturingUnitID, RequestInfoStatus, IsDeleted)
VALUES (1, 1, 'Request for manufacturing', 500, 1, 0);

INSERT INTO MaterialTypes (MaterialTypeID, MaterialTypeName, MaterialTypeStatus, IsDeleted)
VALUES (1, 'Type A', 1, 0);

INSERT INTO Warehouses (WarehouseID, WarehouseName, WarehouseAddress, WarehouseSupervisorID, WarehouseStatus, IsDeleted)
VALUES (1, 'Central Warehouse', '123 Warehouse St', 1, 1, 0);

INSERT INTO Materials (MaterialID, MaterialName, MaterialStatus, IsDeleted) 
VALUES (1, 'kitap', 1, 0),
       (2, 'klavye', 1, 0),
       (3, 'lamba', 1, 0);

INSERT INTO PurchaseRequestDetails (RequestDetailID, RequestID, MaterialID, RequestedAmount, OfferedAmount, OrderedAmount, ProvidedAmount, MaterialStatus, IsDeleted) 
VALUES (1, 1, 1, 10, 0, 0, 0, 1, 0),
       (2, 1, 2, 2, 2, 2, 1, 1, 0),
       (3, 1, 3, 5, 3, 3, 3, 1, 0);

INSERT INTO MaterialSpecs (MaterialSpecID, MaterialID, MainMaterialID, SuckerNo, MaterialNo, PhotoNo, MaterialTypeID, UnitID, IsDeleted)
VALUES (1, 1, NULL, 'SN001', 'MN001', 'PN001', 1, 1, 0);

INSERT INTO MaterialInventory (InventoryID, MaterialID, WarehouseID, Quantity, LastUpdated)
VALUES (1, 1, 1, 100, GETDATE());


SELECT * FROM Users;
SELECT * FROM PurchaseRequests;
SELECT * FROM PurchaseRequestInfos;
SELECT * FROM MaterialTypes;
SELECT * FROM Warehouses;
SELECT * FROM Materials;
SELECT * FROM PurchaseRequestDetails;
SELECT * FROM MaterialSpecs;
SELECT * FROM MaterialInventory;

GO
