-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "offerTitle" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "hotelAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "hotelDescription" TEXT NOT NULL,
    "hotelImageUrl" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION,
    "marketType" TEXT,
    "recommended" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "userActive" BOOLEAN NOT NULL DEFAULT true,
    "adminActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "connection_from_outside" BOOLEAN NOT NULL DEFAULT false,
    "agency" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyInfos" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "RIZCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "agencyAddress" TEXT,
    "phoneNum1" TEXT,
    "phoneNum2" TEXT,
    "phoneNum3" TEXT,
    "MFAType" TEXT,
    "activated" BOOLEAN DEFAULT false,
    "isCompany" BOOLEAN DEFAULT false,
    "useTravelersProfiles" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyInfos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logo" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "logoPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accounting" (
    "id" TEXT NOT NULL,
    "localCurrency" TEXT NOT NULL,
    "localDepositBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agencyCommissionHotel" DOUBLE PRECISION NOT NULL,
    "agencyCommissionLowCoTick" DOUBLE PRECISION NOT NULL,
    "hideEtickectPrice" BOOLEAN NOT NULL DEFAULT false,
    "hideHotelVoucherPrice" BOOLEAN NOT NULL DEFAULT false,
    "hideCancellationPoliciesOnHotelVoucher" BOOLEAN NOT NULL DEFAULT false,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "Accounting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authoration" (
    "id" TEXT NOT NULL,
    "localAutherizedOverdraw" DOUBLE PRECISION NOT NULL,
    "confirmBooking" BOOLEAN NOT NULL DEFAULT false,
    "GDSBookWithoutBalance" BOOLEAN NOT NULL DEFAULT false,
    "foreignCurrencycCertAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "Authoration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "flightBooking" BOOLEAN NOT NULL DEFAULT false,
    "hotelBooking" BOOLEAN NOT NULL DEFAULT false,
    "package" BOOLEAN NOT NULL DEFAULT false,
    "visa" BOOLEAN NOT NULL DEFAULT false,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2C" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "B2CpointOfSale" BOOLEAN NOT NULL DEFAULT false,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "B2C_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "reason" BYTEA,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flagUrl" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visa" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "duration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Visa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaRequestPivot" (
    "id" TEXT NOT NULL,
    "visaId" TEXT NOT NULL,
    "visaRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaRequestPivot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaRequest" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "travelStartingDate" TIMESTAMP(3) NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "documents" TEXT[],
    "nationality" TEXT NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL,
    "visaRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "passportDeliveryDate" TIMESTAMP(3) NOT NULL,
    "passportExpirationDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassengerDocuments" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "label" TEXT DEFAULT 'Document',
    "isMendatory" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassengerDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassengerDocumentsFiles" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PassengerDocumentsFiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceFees" (
    "id" TEXT NOT NULL,
    "tourcodeTitle" TEXT NOT NULL,
    "description" TEXT,
    "GDSProvider" TEXT NOT NULL,

    CONSTRAINT "ServiceFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "tourcodeCompany" TEXT NOT NULL,
    "type" TEXT,
    "itinerary" TEXT NOT NULL,
    "classes" TEXT NOT NULL,
    "bookingFrom" TEXT NOT NULL,
    "bookingTo" TEXT NOT NULL,
    "departureFrom" TEXT NOT NULL,
    "departureTo" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "serviceFeesId" TEXT NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceFeesAccounting" (
    "id" TEXT NOT NULL,
    "fixedPrice" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION DEFAULT 0,
    "serviceFeesId" TEXT NOT NULL,

    CONSTRAINT "ServiceFeesAccounting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Accounting_agencyId_key" ON "Accounting"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Authoration_agencyId_key" ON "Authoration"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_agencyId_key" ON "Products"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "B2C_agencyId_key" ON "B2C"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_identifier_key" ON "Permission"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissions_roleId_permissionId_key" ON "RolePermissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserRole_expiresAt_idx" ON "UserRole"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE INDEX "visa_countryId_idx" ON "Visa"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "PassengerDocuments_passengerId_documentId_key" ON "PassengerDocuments"("passengerId", "documentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agency_fkey" FOREIGN KEY ("agency") REFERENCES "AgencyInfos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "AgencyInfos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accounting" ADD CONSTRAINT "Accounting_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "AgencyInfos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authoration" ADD CONSTRAINT "Authoration_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "AgencyInfos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "AgencyInfos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2C" ADD CONSTRAINT "B2C_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "AgencyInfos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visa" ADD CONSTRAINT "Visa_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRequestPivot" ADD CONSTRAINT "VisaRequestPivot_visaId_fkey" FOREIGN KEY ("visaId") REFERENCES "Visa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRequestPivot" ADD CONSTRAINT "VisaRequestPivot_visaRequestId_fkey" FOREIGN KEY ("visaRequestId") REFERENCES "VisaRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_visaRequestId_fkey" FOREIGN KEY ("visaRequestId") REFERENCES "VisaRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassengerDocuments" ADD CONSTRAINT "PassengerDocuments_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassengerDocuments" ADD CONSTRAINT "PassengerDocuments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "PassengerDocumentsFiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_serviceFeesId_fkey" FOREIGN KEY ("serviceFeesId") REFERENCES "ServiceFees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeesAccounting" ADD CONSTRAINT "ServiceFeesAccounting_serviceFeesId_fkey" FOREIGN KEY ("serviceFeesId") REFERENCES "ServiceFees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
