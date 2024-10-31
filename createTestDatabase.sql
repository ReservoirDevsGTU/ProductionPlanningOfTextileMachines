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



CREATE TABLE PurchaseRequests (
    RequestID INT PRIMARY KEY,
    CreatedBy INT,
    CreationDate DATETIME,
    RequestStatus INT,
    IsDeleted INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseRequestDetails (
    RequestInfoID INT PRIMARY KEY,
    RequestID INT,
    RequestedBy INT,
    RequestDeadline DATE,
    RequestDescription VARCHAR(255),
    ManufacturingUnitID INT,
    RequestDetailStatus INT,
    IsDeleted INT,
    FOREIGN KEY (RequestID) REFERENCES PurchaseRequests(RequestID),
    FOREIGN KEY (RequestedBy) REFERENCES Users(UserID)
);

CREATE TABLE Materials (
    MaterialID INT PRIMARY KEY,
    MaterialName VARCHAR(100),
    MaterialStatus INT,
    IsDeleted INT
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

CREATE TABLE PurchaseRequestItems (
    ItemID INT PRIMARY KEY,
    RequestID INT,
    MaterialID INT,
    RequestedAmount DECIMAL(18, 2),
    OrderedAmount DECIMAL(18, 2),
    ProvidedAmount DECIMAL(18, 2),
    ItemStatus INT,
    IsDeleted INT,
    FOREIGN KEY (RequestID) REFERENCES PurchaseRequests(RequestID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

CREATE TABLE Suppliers (
    SupplierID INT PRIMARY KEY,
    SupplierName VARCHAR(100),
    SupplierTaxCode VARCHAR(50),
    SupplierTelNo VARCHAR(50),
    SupplierEmail VARCHAR(100),
    SupplierAddress VARCHAR(255),
    SupplierNotes VARCHAR(255),
    SupplierStatus INT,
    IsDeleted INT
);

CREATE TABLE PurchaseOffers (
    OfferID INT PRIMARY KEY,
    OfferGroupID INT,
    CreatedBy INT,
    CreationDate DATETIME,
    OfferStatus INT,
    IsDeleted INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseOfferDetails (
    DetailID INT PRIMARY KEY,
    OfferID INT,
    OfferDate DATE,
    OfferDeadline DATE,
    RequestedBy INT,
    OfferDescription VARCHAR(255),
    SupplierID INT,
    DetailStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OfferID) REFERENCES PurchaseOffers(OfferID),
    FOREIGN KEY (RequestedBy) REFERENCES Users(UserID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

CREATE TABLE PurchaseOfferItems (
    ItemID INT PRIMARY KEY,
    OfferID INT,
    RequestItemID INT,
    MaterialID INT,
    RequestedAmount DECIMAL(18, 2),
    OfferedAmount DECIMAL(18, 2),
    OfferedPrice DECIMAL(18, 2),
    ConformationStatus INT,
    ItemStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OfferID) REFERENCES PurchaseOffers(OfferID),
    FOREIGN KEY (RequestItemID) REFERENCES PurchaseRequestItems(ItemID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

INSERT INTO Users (UserID, UserName, Name, Surname, UserEmail, UserStatus) 
VALUES 
    (1, 'Çağrı', 'Cağrı', 'Özcanlı', 'cagriözcanli@gmail.com', 1),
    (2, 'jfouche', 'Batuhan', 'Altun', 'batuhanaltun@gmail.com', 1),
    (3, 'Mert', 'Mert', 'Seker', 'mertseker@gmail.com', 1),
    (4, 'mrwhite', 'mehme', 'Mrtekin', 'baytekin@gmail.com', 1),
    (5, 'Baran', 'Baran', 'Sahin', 'baransahin@gmail.com', 1);

INSERT INTO PurchaseRequests (RequestID, CreatedBy, CreationDate, RequestStatus, IsDeleted) 
VALUES 
    (1, 1, '2024-10-20 14:30:00', 1, 0),
    (2, 2, '2024-10-21 09:15:00', 2, 0),
    (3, 3, '2024-10-22 11:45:00', 1, 0),
    (4, 4, '2024-10-23 10:00:00', 3, 0),
    (5, 5, '2024-10-24 13:20:00', 1, 0);

INSERT INTO PurchaseRequestDetails (RequestInfoID, RequestID, RequestedBy, RequestDeadline, RequestDescription, ManufacturingUnitID, RequestDetailStatus, IsDeleted)
VALUES 
    (1, 1, 2, '2024-11-01', 'Elektronik', 100, 1, 0),
    (2, 2, 3, '2024-11-05', 'Ofis Eşyaları', 101, 1, 0),
    (3, 3, 4, '2024-11-07', 'Temizlik Malzemeleri', 102, 2, 0),
    (4, 4, 5, '2024-11-10', 'Bakım Ekipmanları', 103, 1, 0),
    (5, 5, 1, '2024-11-15', 'Bilgisayar Ekipmanları', 104, 1, 0);

INSERT INTO Materials (MaterialID, MaterialName, MaterialStatus, IsDeleted)
VALUES 
    (1, 'Laptop', 1, 0),
    (2, 'Fare', 1, 0),
    (3, 'Klavye', 1, 0),
    (4, 'Monitör', 1, 0),
    (5, 'Yazıcı', 1, 0);

INSERT INTO MaterialTypes (MaterialTypeID, MaterialTypeName, MaterialTypeStatus, IsDeleted)
VALUES (1, 'Type A', 1, 0);

INSERT INTO Warehouses (WarehouseID, WarehouseName, WarehouseAddress, WarehouseSupervisorID, WarehouseStatus, IsDeleted)
VALUES (1, 'Central Warehouse', '123 Warehouse St', 1, 1, 0);

INSERT INTO MaterialSpecs (MaterialSpecID, MaterialID, MainMaterialID, SuckerNo, MaterialNo, PhotoNo, MaterialTypeID, UnitID, IsDeleted)
VALUES (1, 1, NULL, 'SN001', 'MN001', 'PN001', 1, 1, 0);

INSERT INTO MaterialInventory (InventoryID, MaterialID, WarehouseID, Quantity, LastUpdated)
VALUES (1, 1, 1, 100, GETDATE());


INSERT INTO PurchaseRequestItems (ItemID, RequestID, MaterialID, RequestedAmount, OrderedAmount, ProvidedAmount, ItemStatus, IsDeleted)
VALUES 
    (1, 1, 1, 10, 5, 5, 1, 0),
    (2, 1, 2, 20, 15, 10, 1, 0),
    (3, 2, 3, 5, 2, 1, 1, 0),
    (4, 3, 4, 8, 4, 4, 1, 0),
    (5, 4, 5, 12, 6, 6, 1, 0);


INSERT INTO Suppliers (SupplierID, SupplierName, SupplierTaxCode, SupplierTelNo, SupplierEmail, SupplierAddress, SupplierNotes, SupplierStatus, IsDeleted)
VALUES 
    (1, 'Teknoloji Tedarikçileri', '12345', '123-456-7890', 'teknotedarik@tek.com', ' Teknoloji Cad.', 'Önde gelen teknoloji tedarikçisi', 1, 0),
    (2, 'Ofis Malzemeleri', '67890', '234-567-8901', 'ofismalz@ofis.com', 'Ofis Sok.', 'Güvenilir ofis tedarikçisi', 1, 0),
    (3, 'Temizlik Malzemeleri', '54321', '345-678-9012', 'temizlik@tem.com', ' Temizlik Bulv.', 'Kaliteli temizlik malzemeleri tedarikçisi', 1, 0),
    (4, 'Bakım Ekipmanları', '98765', '456-789-0123', 'bakimtedarik@btkd.com', ' Bakım Mah.', 'Güvenilir bakım ekipmanları tedarikçisi', 1, 0),
    (5, 'Bilgisayar Dünyası', '19283', '567-890-1234', 'bilgisayardunyasi@bdunyasi.com', ' Bilgisayar Sok.', 'Bilgisayar aksesuarları konusunda uzmanlaşmış', 1, 0);


INSERT INTO PurchaseOffers (OfferID, OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
VALUES 
    (1, 101, 1, '2024-10-25 12:00:00', 1, 0),
    (2, 102, 2, '2024-10-26 10:30:00', 2, 0),
    (3, 103, 3, '2024-10-27 15:45:00', 1, 0),
    (4, 104, 4, '2024-10-28 09:00:00', 1, 0),
    (5, 105, 5, '2024-10-29 11:20:00', 3, 0);

INSERT INTO PurchaseOfferDetails (DetailID, OfferID, OfferDate, OfferDeadline, RequestedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
VALUES 
    (1, 1, '2024-10-30', '2024-11-15', 2, 'Elektronik ', 1, 1, 0),
    (2, 2, '2024-10-31', '2024-11-20', 3, 'Ofis Eşyaları', 2, 1, 0),
    (3, 3, '2024-11-01', '2024-11-22', 4, 'Temizlik Malzemeleri', 3, 2, 0),
    (4, 4, '2024-11-02', '2024-11-25', 5, 'Bakım Ekipmanları', 4, 1, 0),
    (5, 5, '2024-11-03', '2024-11-28', 1, 'Bilgisayar Ekipmanları', 5, 1, 0);

INSERT INTO PurchaseOfferItems (ItemID, OfferID, RequestItemID, MaterialID, RequestedAmount, OfferedAmount, OfferedPrice, ConformationStatus, ItemStatus, IsDeleted)
VALUES 
    (1, 1, 1, 1, 10, 8, 1200.00, 1, 1, 0),
    (2, 1, 2, 2, 20, 18, 25.50, 1, 1, 0),
    (3, 2, 3, 3, 5, 4, 50.00, 2, 1, 0),
    (4, 3, 4, 4, 8, 7, 200.00, 1, 1, 0),
    (5, 4, 5, 5, 12, 10, 300.00, 1, 1, 0);



SELECT * FROM Users;
SELECT * FROM PurchaseRequests;
SELECT * FROM PurchaseRequestDetails;
SELECT * FROM PurchaseRequestItems;
SELECT * FROM Materials;
SELECT * FROM PurchaseOffers;
SELECT * FROM PurchaseOfferDetails;
SELECT * FROM PurchaseOfferItems;
SELECT * FROM Suppliers;
SELECT * FROM MaterialTypes;
SELECT * FROM Warehouses;
SELECT * FROM MaterialSpecs;
SELECT * FROM MaterialInventory;
GO

