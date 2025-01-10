IF EXISTS (SELECT name FROM dbo.sysdatabases WHERE name = 'TestDatabase')
    DROP DATABASE TestDatabase;
GO

CREATE DATABASE TestDatabase;
GO

USE TestDatabase;

SET NOCOUNT ON;

CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1, 1),
    UserName VARCHAR(100),
    Name VARCHAR(100),
    Surname VARCHAR(100),
    UserEmail VARCHAR(100),
    UserStatus INT
);

CREATE TABLE Groups (
    GroupID INT PRIMARY KEY IDENTITY(1, 1),
    GroupName VARCHAR(100),
    GroupMaster INT,
    GroupActionShow INT,
    GroupStatus INT
);

CREATE TABLE GroupUsers (
    GroupUserID INT PRIMARY KEY IDENTITY(1, 1),
    GroupID INT,
    UserID INT,
    FOREIGN KEY (GroupID) REFERENCES Groups(GroupID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE MaterialTypes (
    MaterialTypeID INT PRIMARY KEY IDENTITY(1, 1),
    MaterialTypeName VARCHAR(100),
    MaterialTypeStatus INT,
    IsDeleted INT
);

CREATE TABLE Warehouses (
    WarehouseID INT PRIMARY KEY IDENTITY(1, 1),
    WarehouseName VARCHAR(100),
    WarehouseAddress VARCHAR(255),
    WarehouseSupervisorID INT,
    WarehouseStatus INT,
    IsDeleted INT,
    FOREIGN KEY (WarehouseSupervisorID) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseRequests (
    RequestID INT PRIMARY KEY IDENTITY(1, 1),
    CreatedBy INT,
    CreationDate DATETIME,
    RequestStatus INT,
    IsDeleted INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseRequestDetails (
    RequestInfoID INT PRIMARY KEY IDENTITY(1, 1),
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
    MaterialID INT PRIMARY KEY IDENTITY(1, 1),
    MaterialName VARCHAR(100),
    MaterialStatus INT,
    IsDeleted INT
);

CREATE TABLE MaterialTransactionTypes (
    TransactionTypeID INTEGER PRIMARY KEY IDENTITY(1, 1),
    TransactionTypeName VARCHAR(255),
    TransactionTypeEffectID INTEGER,
    TransactionTypeEffectDescription VARCHAR(255),
    ShownInDropdown INTEGER,
    TransactionTypeStatus INTEGER,
    IsDeleted INTEGER
);

CREATE TABLE MaterialSpecs (
    MaterialSpecID INT PRIMARY KEY IDENTITY(1, 1),
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
    InventoryID INT PRIMARY KEY IDENTITY(1, 1),
    MaterialID INT,
    WarehouseID INT,
    Quantity DECIMAL(18, 2),
    LastUpdated DATETIME,
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

CREATE TABLE PurchaseRequestItems (
    ItemID INT PRIMARY KEY IDENTITY(1, 1),
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
    SupplierID INT PRIMARY KEY IDENTITY(1, 1),
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
    ContactDetailID INT PRIMARY KEY IDENTITY(1, 1),
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
    OfferID INT PRIMARY KEY IDENTITY(1, 1),
    OfferGroupID INT,
    CreatedBy INT,
    CreationDate DATETIME,
    OfferStatus INT,
    IsDeleted INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseOfferDetails (
    DetailID INT PRIMARY KEY IDENTITY(1, 1),
    OfferID INT,
    OfferDate DATE,
    ValidityDate DATE,
    OfferDeadline DATE,
    RequestedBy INT,
    EvaluatedBy INT,
    OfferDescription VARCHAR(255),
    SupplierID INT,
    DetailStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OfferID) REFERENCES PurchaseOffers(OfferID),
    FOREIGN KEY (RequestedBy) REFERENCES Users(UserID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    FOREIGN KEY (EvaluatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseOfferItems (
    ItemID INT PRIMARY KEY IDENTITY(1, 1),
    OfferID INT,
    RequestItemID INT,
    MaterialID INT,
    OfferRequestedAmount DECIMAL(18, 2),
    OfferedAmount DECIMAL(18, 2),
    OfferedPrice DECIMAL(18, 2),
    ItemStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OfferID) REFERENCES PurchaseOffers(OfferID),
    FOREIGN KEY (RequestItemID) REFERENCES PurchaseRequestItems(ItemID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

CREATE TABLE PurchaseOrders (
    OrderID INT PRIMARY KEY IDENTITY(1, 1),
    CreatedBy INT,
    CreationDate DATETIME,
    OrderStatus INT,
    IsDeleted INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE TABLE PurchaseOrderDetails (
    DetailID INT PRIMARY KEY IDENTITY(1, 1),
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
    ItemID INT PRIMARY KEY IDENTITY(1, 1),
    OrderID INT,
    OfferItemID INT,
    RequestItemID INT,
    MaterialID INT,
    OrderedAmount DECIMAL(18, 2),
    ProvidedAmount DECIMAL(18, 2),
    UnitPrice DECIMAL(18,2),
    ItemStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (ItemID) REFERENCES PurchaseOfferItems(ItemID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID),
    FOREIGN KEY (RequestItemID) REFERENCES PurchaseRequestItems(ItemID),
    FOREIGN KEY (OfferItemID) REFERENCES PurchaseOfferItems(ItemID),
);

CREATE TABLE DeliveryDetails (
    DetailID INT PRIMARY KEY IDENTITY(1, 1),
    OrderID INT,
    InvoiceNo VARCHAR(255),
    ReceivedBy INT,
    DeliveredBy VARCHAR(255),
    DeliveryNotes VARCHAR(255),
    DetailsStatus INT,
    IsDeleted INT,
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (ReceivedBy) REFERENCES Users(UserID)
);

CREATE TABLE MaterialTransactions (
    TransactionID INTEGER PRIMARY KEY IDENTITY(1, 1),
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
    TransactionDetailID INTEGER PRIMARY KEY IDENTITY(1, 1),
    TransactionID INTEGER,
    MaterialID INTEGER,
    Quantity DECIMAL(18, 2),
    CreationDate DATETIME,
    FOREIGN KEY (TransactionID) REFERENCES MaterialTransactions(TransactionID),
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
);

INSERT INTO MaterialTransactionTypes (TransactionTypeName, TransactionTypeEffectID, TransactionTypeEffectDescription, ShownInDropdown, TransactionTypeStatus, IsDeleted)
VALUES 
('Ambarlar Arası Transfer', 1, 'Artırır/Increases', 1, 1, 0),
('Manuel Giriş', 2, 'Azaltır/Decreases', 1, 1, 0),
('Manuel Çıkış', 3, 'Transfer', 1, 1, 0),
('Siparişten Giriş', 1, 'Artırır/Increases', 0, 1, 0);

DECLARE @nGroups INT = 10;
DECLARE @nItems INT = 1000;
DECLARE @nSubItems INT = 10;
DECLARE @nRequestStatus INT = 4;
DECLARE @nOfferStatus INT = 7;
DECLARE @nOrderStatus INT = 3;

DECLARE @n INT = 1000;
DECLARE @m INT = 10;

DECLARE @i INT = 1;
DECLARE @j INT = 1;

WHILE @i <= @nGroups
BEGIN
    INSERT INTO Groups (GroupName, GroupMaster, GroupActionShow, GroupStatus)
    VALUES
    (
        CONCAT('group', @i),
        @i * @n / @nGroups,
        0,
        0
    );

    SET @i = @i + 1;
END

SET @i = 1;

WHILE @i <= @n
BEGIN
    INSERT INTO Users (UserName, Name, Surname, UserEmail, UserStatus)
    VALUES 
    (
        CONCAT('user', @i), 
        CONCAT('name', @i), 
        CONCAT('surname', @i), 
        CONCAT('user', @i, '@gmail.com'), 
        0
    );

    INSERT INTO GroupUsers (GroupID, UserID)
    VALUES (
        (@i - 1) / (@n / @nGroups) + 1,
        @i
    );

    INSERT INTO PurchaseRequests (CreatedBy, CreationDate, RequestStatus, IsDeleted)
    VALUES 
    (
        @i, 
        DATEADD(DAY, @i - 1, '2024-10-20 14:53:00'), 
        @i % @nRequestStatus,
        0
    );

    INSERT INTO PurchaseRequestDetails (RequestID, RequestedBy, RequestDeadline, RequestDescription, ManufacturingUnitID, RequestDetailStatus, IsDeleted)
    VALUES 
    (
        @i,
        @i, 
        DATEADD(DAY, @i, '2024-12-01'), 
        CONCAT('description ', @i), 
        100 + @i, 
        0,
        0
    );

    INSERT INTO Materials (MaterialName, MaterialStatus, IsDeleted)
    VALUES 
    (
        CONCAT('material ', @i), 
        0,
        0
    );

    INSERT INTO MaterialTypes (MaterialTypeName, MaterialTypeStatus, IsDeleted)
    VALUES 
    (
        CONCAT('type ', @i), 
        0,
        0
    );

    INSERT INTO Warehouses (WarehouseName, WarehouseAddress, WarehouseSupervisorID, WarehouseStatus, IsDeleted)
    VALUES 
    (
        CONCAT('warehouse ', @i), 
        CONCAT('address ', @i), 
        1, 
        0,
        0
    );
 
    INSERT INTO MaterialSpecs (MaterialID, MainMaterialID, SuckerNo, MaterialNo, PhotoNo, MaterialTypeID, UnitID, IsDeleted)
    VALUES 
    (
        @i,
        @i, 
        CONCAT('SN', @i), 
        CONCAT('MN', @i), 
        CONCAT('PN', @i), 
        @i, 
        1, 
        0
    );

    INSERT INTO MaterialInventory (MaterialID, WarehouseID, Quantity, LastUpdated)
    VALUES 
    (
        @i, 
        @i, 
        @i * 10, 
        GETDATE()
    );
  
    INSERT INTO Suppliers (SupplierName, SupplierTaxCode, SupplierTelNo, SupplierEmail, SupplierAddress, SupplierNotes, SupplierStatus, IsDeleted)
    VALUES 
    (
        CONCAT('supplier ', @i), 
        CONCAT('taxcode', @i), 
        CONCAT('+905000000000', @i), 
        CONCAT('supplier', @i, '@gmail.com'), 
        CONCAT('address ', @i), 
        CONCAT('notes for supplier ', @i), 
        0,  
        0
    );

    INSERT INTO SupplierContactDetails(SupplierID, ContactName, ContactSurname, ContactTitle, ContactPhoneNo, ContactEmail, IsDeleted)
    VALUES
    (
        @i,
        CONCAT('suppliercontactname', @i),
        CONCAT('suppliercontactsurname', @i),
        CONCAT('level', @i,'patron'),
        CONCAT('+905000000000', @i),
        CONCAT('Contact', @i,'@gmail.com'),
        0
    );
    
    INSERT INTO PurchaseOffers (OfferGroupID, CreatedBy, CreationDate, OfferStatus, IsDeleted)
    VALUES 
    (
        @i, 
        @i, 
        DATEADD(DAY, @i - 1, '2024-10-25 12:00:00'), 
        @i % @nOfferStatus,
        0
    );

    INSERT INTO PurchaseOfferDetails (OfferID, OfferDate, ValidityDate, OfferDeadline, RequestedBy, EvaluatedBy, OfferDescription, SupplierID, DetailStatus, IsDeleted)
    VALUES 
    (
        @i, 
        DATEADD(DAY, @i - 1, '2024-12-30'), 
        DATEADD(DAY, @i, '2024-12-20'), 
        DATEADD(DAY, @i, '2024-12-15'), 
        @i, 
        @i,
        CONCAT('description ', @i), 
        @i, 
        0,
        0
    );


    INSERT INTO PurchaseOrders (CreatedBy, CreationDate, OrderStatus, IsDeleted)
    VALUES 
    (
        @i, 
        DATEADD(DAY, @i - 1, '2024-10-25 12:00:00'), 
        @i % @nOrderStatus, 
        0
    );

    INSERT INTO PurchaseOrderDetails (OrderID, OrderDate, ShippingDate, OrderDeadline, OrderNotes, SupplierID, DetailStatus, IsDeleted)
    VALUES 
    (
        @i, 
        DATEADD(DAY, @i - 1, '2024-12-30'), 
        DATEADD(DAY, @i + 5, '2024-12-30'), 
        DATEADD(DAY, @i + 10, '2024-12-30'), 
        CONCAT('Order Notes ', @i), 
        @i,
        0,  
        0
    );

    INSERT INTO MaterialTransactions (TransactionNo, TransactionDate, TransactionTypeID, WarehouseID, CreationDate, RequestID, OrderID)
    VALUES 
    (
        CONCAT('TransactionNO', @i),
        DATEADD(DAY, @i - 1, '2024-01-01'),
        (@i % 4) + 1,
        @i,
        DATEADD(MINUTE, @i, '2024-01-01 00:00:00'),
        @i,
        @i 
    );

    INSERT INTO MaterialTransactionDetails (TransactionID, MaterialID, Quantity, CreationDate)
    VALUES 
    (
        @i,
        @i,
        @i,
        DATEADD(SECOND, @i, '2025-01-01 00:00:00')
    );

	INSERT INTO DeliveryDetails (OrderID, InvoiceNo, ReceivedBy, DeliveredBy, DeliveryNotes, DetailsStatus, IsDeleted)
    VALUES 
    (
        @i,
        CONCAT('InvoiceNo',@i),
        @i,
        CONCAT('Delivered by', @i),
        CONCAT('Delivery Note', @i),
        @i % 3,  
        0
    );

    SET @i = @i + 1;
END;

SET @i = 1;
WHILE @i <= @n
    BEGIN
    SET @j = 1 + (@i - 1) * @m;

    WHILE @j <= @i * @m
    BEGIN
        DECLARE @mid INT = @j % @n;

        IF @mid = 0
            SET @mid = @n;

        INSERT INTO PurchaseRequestItems (RequestID, MaterialID, RequestedAmount, ProvidedAmount, ItemStatus, IsDeleted)
        VALUES 
        (
            @i, 
            @mid, 
            @j,  
            @j, 
            CASE @i % @nRequestStatus
                WHEN 2 THEN 1
                WHEN 3 THEN 2
                ELSE 0 
            END,  
            0
        );

        INSERT INTO PurchaseOfferItems (OfferID, RequestItemID, MaterialID, OfferRequestedAmount, OfferedAmount, OfferedPrice, ItemStatus, IsDeleted)
        VALUES 
        (
            @i, 
            @j, 
            @mid, 
            @j,
            @j, 
            @j, 
            CASE @i % @nOfferStatus
                WHEN 4 THEN 1
                WHEN 5 THEN 2 
                WHEN 6 THEN @j % 2 + 1
                ELSE 0 
            END,
            0
        );

        INSERT INTO PurchaseOrderItems (OrderID, OfferItemID, RequestItemID, MaterialID, OrderedAmount, ProvidedAmount, UnitPrice, ItemStatus, IsDeleted)
        VALUES 
        (
            @i, 
            @j, 
            @j, 
            @mid, 
            @j,  
            @j,   
            CASE @i % @nOrderStatus
                WHEN 1 THEN @j / 2
                WHEN 2 THEN @j
                ELSE 0
            END,  
            @i % @nOrderStatus,  
            0
        );
    
        SET @j = @j + 1;
    END;

    SET @i = @i + 1;
END;

GO
