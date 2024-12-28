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

CREATE TABLE MaterialTransactionTypes (
    TransactionTypeID INTEGER PRIMARY KEY,
    TransactionTypeName VARCHAR(255),
    TransactionTypeEffectID INTEGER,
    TransactionTypeEffectDescription VARCHAR(255),
    ShownInDropdown INTEGER,
    TransactionTypeStatus INTEGER,
    IsDeleted INTEGER
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

CREATE TABLE SupplierContactDetails (
    ContactDetailID INT PRIMARY KEY,
    SupplierID INT,
    ContactName VARCHAR(100),
    ContactSurname VARCHAR(100),
    ContactTitle VARCHAR(100),
    ContactPhoneNo VARCHAR(50),
    ContactEmail VARCHAR(100),
    IsDeleted INT,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
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
    OfferRequestedAmount DECIMAL(18, 2),
    OfferedAmount DECIMAL(18, 2),
    OfferedPrice DECIMAL(18, 2),
    ConformationStatus INT,
    ItemStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OfferID) REFERENCES PurchaseOffers(OfferID),
    FOREIGN KEY (RequestItemID) REFERENCES PurchaseRequestItems(ItemID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

CREATE TABLE PurchaseOrders (
    OrderID INT PRIMARY KEY,
    CreatedBy INT,
    CreationDate DATETIME,
    OrderStatus INT,
    IsDeleted INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseOrderDetails (
    DetailID INT PRIMARY KEY,
    OrderID INT,
    OrderDate DATE,
    ShippingDate DATE,
    OrderDeadline DATE,
    OrderNotes VARCHAR(255),
    SupplierID INT,
    DetailStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

CREATE TABLE PurchaseOrderItems (
    ItemID INT PRIMARY KEY,
    OrderID INT,
    OfferItemID INT,
    MaterialID INT,
    OrderedAmount DECIMAL(18, 2),
    ProvidedAmount DECIMAL(18, 2),
    UnitPrice DECIMAL(18,2),
    ItemStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (ItemID) REFERENCES PurchaseOfferItems(ItemID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

CREATE TABLE DeliveryDetails (
    DetailID INT PRIMARY KEY,
    OrderID INT,
    InvoiceNo VARCHAR(255),
    ReceivedBy INT,
    DeliveredBy VARCHAR(255),
    DeliveryNotes VARCHAR(255),
    DetailsStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (ReceivedBy) REFERENCES Users(UserID)
)

CREATE TABLE MaterialTransactions (
    TransactionID INTEGER PRIMARY KEY,
    TransactionNo VARCHAR(255),
    TransactionDate DATE,
    TransactionTypeID INTEGER,
    WarehouseID INTEGER,
    CreationDate DATETIME,
    RequestID INTEGER,
    OrderID INTEGER,
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (RequestID) REFERENCES PurchaseRequests(RequestID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),    
    FOREIGN KEY (TransactionTypeID) REFERENCES MaterialTransactionTypes(TransactionTypeID)
);

CREATE TABLE MaterialTransactionDetails (
    TransactionDetailID INTEGER PRIMARY KEY,
    TransactionID INTEGER,
    MaterialID INTEGER,
    Quantity DECIMAL(18, 2),
    CreationDate DATETIME,
    FOREIGN KEY (TransactionID) REFERENCES MaterialTransactions(TransactionID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

INSERT INTO MaterialTransactionTypes (TransactionTypeID, TransactionTypeName, TransactionTypeEffectID, TransactionTypeEffectDescription, ShownInDropdown, TransactionTypeStatus, IsDeleted)
VALUES 
(1, 'Ambarlar Arası Transfer', 1, 'Artırır/Increases', 1, 1, 0),
(2, 'Manuel Giriş', 2, 'Azaltır/Decreases', 1, 1, 0),
(3, 'Manuel Çıkış', 3, 'Transfer', 1, 1, 0),
(4, 'Siparişten Giriş', 1, 'Artırır/Increases', 0, 1, 0);

DECLARE @i INT = 1;
DECLARE @j INT;

WHILE @i <= 1000
BEGIN
    INSERT INTO Users (UserID, UserName, Name, Surname, UserEmail, UserStatus)
    VALUES 
    (
        @i, 
        CONCAT('user', @i), 
        CONCAT('name', @i), 
        CONCAT('surname', @i), 
        CONCAT('user', @i, '@gmail.com'), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END 
    );

    INSERT INTO PurchaseRequests (RequestID, CreatedBy, CreationDate, RequestStatus, IsDeleted)
    VALUES 
    (
        @i, 
        @i, 
        DATEADD(DAY, @i - 1, '2024-10-20 14:53:00'), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END, 
        0
    );

    INSERT INTO PurchaseRequestDetails (RequestInfoID, RequestID, RequestedBy, RequestDeadline, RequestDescription, ManufacturingUnitID, RequestDetailStatus, IsDeleted)
    VALUES 
    (
        @i,
        @i,
        @i, 
        DATEADD(DAY, @i, '2024-12-01'), 
        CONCAT('description ', @i), 
        100 + @i, 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END, 
        0
    );

    INSERT INTO Materials (MaterialID, MaterialName, MaterialStatus, IsDeleted)
    VALUES 
    (
        @i,
        CONCAT('material ', @i), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );

    INSERT INTO MaterialTypes (MaterialTypeID, MaterialTypeName, MaterialTypeStatus, IsDeleted)
    VALUES 
    (
        @i, 
        CONCAT('type ', @i), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );

    INSERT INTO Warehouses (WarehouseID, WarehouseName, WarehouseAddress, WarehouseSupervisorID, WarehouseStatus, IsDeleted)
    VALUES 
    (
        @i, 
        CONCAT('warehouse ', @i), 
        CONCAT('address ', @i), 
        1, 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );
 
    INSERT INTO MaterialSpecs (MaterialSpecID, MaterialID, MainMaterialID, SuckerNo, MaterialNo, PhotoNo, MaterialTypeID, UnitID, IsDeleted)
    VALUES 
    (
        @i,
        @i,
        @i, 
        CONCAT('SN', @i), 
        CONCAT('MN', @i), 
        CONCAT('PN', @i), 
        @i, 
        1, 
        0
    );

    INSERT INTO MaterialInventory (InventoryID, MaterialID, WarehouseID, Quantity, LastUpdated)
    VALUES 
    (
        @i,
        @i, 
        @i, 
        @i * 10, 
        GETDATE()
    );

    SET @j = 1;
    WHILE @j <= 3
    BEGIN
    INSERT INTO PurchaseRequestItems (ItemID, RequestID, MaterialID, RequestedAmount, ProvidedAmount, ItemStatus, IsDeleted)
    VALUES 
    (
        (@i - 1) * 3 + @j,
        @i, 
        @i, 
        @i,  
        @i, 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );
  
    INSERT INTO Suppliers (SupplierID, SupplierName, SupplierTaxCode, SupplierTelNo, SupplierEmail, SupplierAddress, SupplierNotes, SupplierStatus, IsDeleted)
    VALUES 
    (
        (@i - 1) * 3 + @j, 
        CONCAT('supplier ', (@i - 1) * 3 + @j), 
        CONCAT('taxcode', (@i - 1) * 3 + @j), 
        CONCAT('+905000000000', (@i - 1) * 3 + @j), 
        CONCAT('supplier', (@i - 1) * 3 + @j, '@gmail.com'), 
        CONCAT('address ', (@i - 1) * 3 + @j), 
        CONCAT('notes for supplier ', (@i - 1) * 3 + @j), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );

    INSERT INTO SupplierContactDetails(ContactDetailID, SupplierID, ContactName, ContactSurname, ContactTitle, ContactPhoneNo, ContactEmail, IsDeleted)
    VALUES
    (
        (@i - 1) * 3 + @j,
        @i,
        CONCAT('suppliercontactname', (@i - 1) * 3 + @j),
        CONCAT('suppliercontactsurname', (@i -  1) * 3 + @j),
        CONCAT('level', (@i - 1) * 3 + @j,'patron'),
        CONCAT('+905000000000', (@i - 1) * 3 + @j),
        CONCAT('Contact', (@i - 1) * 3 + @j,'@gmail.com'),
        0
    );
    SET @j = @j + 1;
    END
    
    INSERT INTO PurchaseOffers (OfferID, OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
    VALUES 
    (
        @i, 
        100 + @i, 
        @i, 
        DATEADD(DAY, @i - 1, '2024-10-25 12:00:00'), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END, 
        0
    );

    INSERT INTO PurchaseOfferDetails (DetailID, OfferID, OfferDate, OfferDeadline, RequestedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
    VALUES 
    (
        @i,
        @i, 
        DATEADD(DAY, @i - 1, '2024-12-30'), 
        DATEADD(DAY, @i, '2024-12-15'), 
        @i, 
        CONCAT('description ', @i), 
        @i, 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );

    SET @j = 1;
    WHILE @j <= 3
    BEGIN
    INSERT INTO PurchaseOfferItems (ItemID, OfferID, RequestItemID, MaterialID, OfferRequestedAmount, OfferedAmount, OfferedPrice, ConformationStatus, ItemStatus, IsDeleted)
    VALUES 
    (
        (@i - 1) * 3 + @j,
        @i, 
        @i, 
        @i, 
        10 + (@i - 1) * 3 + @j,
        8 + (@i - 1) * 3 + @j, 
        100.00 + ((@i - 1) * 3 + @j * 10.00), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );
    SET @j = @j + 1;
    END

    INSERT INTO PurchaseOrders (OrderID, CreatedBy, CreationDate, OrderStatus, IsDeleted)
    VALUES 
    (
        @i, 
        @i, 
        DATEADD(DAY, @i - 1, '2024-10-25 12:00:00'), 
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END, 
        0
    );

    INSERT INTO PurchaseOrderDetails (DetailID, OrderID, OrderDate, ShippingDate, OrderDeadline, OrderNotes, SupplierID, DetailStatus, IsDeleted)
    VALUES 
    (
        @i, 
        @i, 
        DATEADD(DAY, @i - 1, '2024-12-30'), 
        DATEADD(DAY, @i + 5, '2024-12-30'), 
        DATEADD(DAY, @i + 10, '2024-12-30'), 
        CONCAT('Order Notes ', @i), 
        @i,
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );

    SET @j = 1;
    WHILE @j <= 3
    BEGIN
        INSERT INTO PurchaseOrderItems (ItemID, OrderID, OfferItemID, MaterialID, OrderedAmount, ProvidedAmount, UnitPrice, ItemStatus, IsDeleted)
        VALUES 
        (
            (@i - 1) * 3 + @j, 
            @i, 
            @i, 
            @i, 
            10 + (@i - 1) * 3 + @j,  
            8 + (@i - 1) * 3 + @j,   
            100.00 + ((@i - 1) * 3 + @j * 10.00),  
            CASE 
                WHEN @i % 3 = 1 THEN 1 
                WHEN @i % 3 = 2 THEN 2 
                ELSE 3 
            END,  
            0
        );
        SET @j = @j + 1;
    END

    INSERT INTO MaterialTransactions (TransactionID, TransactionNo, TransactionDate, TransactionTypeID, WarehouseID, CreationDate, RequestID, OrderID)
    VALUES 
    (
        @i,
        CONCAT('TransactionNO', @i),
        DATEADD(DAY, @i - 1, '2024-01-01'),
        (@i % 4) + 1,
        @i,
        DATEADD(MINUTE, @i, '2024-01-01 00:00:00'),
        @i,
        @i 
    );

    INSERT INTO MaterialTransactionDetails (TransactionDetailID, TransactionID, MaterialID, Quantity, CreationDate)
    VALUES 
    (
        @i,
        @i,
        @i,
        @i,
        DATEADD(SECOND, @i, '2025-01-01 00:00:00')
    );

	INSERT INTO DeliveryDetails (DetailID, OrderID, InvoiceNo, ReceivedBy, DeliveredBy, DeliveryNotes, DetailsStatus, IsDeleted)
    VALUES 
    (
        @i,
        @i,
        CONCAT('InvoiceNo',@i),
        @i,
        CONCAT('Delivered by', @i),
        CONCAT('Delivery Note', @i),
        CASE 
            WHEN @i % 3 = 1 THEN 1 
            WHEN @i % 3 = 2 THEN 2 
            ELSE 3 
        END,  
        0
    );

    SET @i = @i + 1;
END;


SELECT * FROM Users;
SELECT * FROM PurchaseRequests;
SELECT * FROM PurchaseRequestDetails;
SELECT * FROM PurchaseRequestItems;
SELECT * FROM Materials;
SELECT * FROM PurchaseOffers;
SELECT * FROM PurchaseOfferDetails;
SELECT * FROM PurchaseOfferItems;
SELECT * FROM Suppliers;
SELECT * FROM SupplierContactDetails;
SELECT * FROM MaterialTypes;
SELECT * FROM Warehouses;
SELECT * FROM MaterialSpecs;
SELECT * FROM MaterialInventory;
SELECT * FROM PurchaseOrders;
SELECT * FROM PurchaseOrderDetails;
SELECT * FROM PurchaseOrderItems;
SELECT * FROM MaterialTransactions;
SELECT * FROM MaterialTransactionDetails;
SELECT * FROM DeliveryDetails;
SELECT * FROM MaterialTransactionTypes
GO
