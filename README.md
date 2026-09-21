# University Recognition and Accreditation Management System

A web-based **University Recognition and Accreditation Management System** designed to streamline the process of managing university recognition requests, academic advisors, meetings, documents, and related administrative workflows.

The system was developed as a **Graduation Project** to provide a centralized digital platform for managing and tracking university recognition and accreditation processes.

---

## 📌 Project Overview

The **University Recognition and Accreditation Management System** provides a structured platform for managing recognition-related requests and administrative operations.

The system aims to reduce manual work, organize recognition records, facilitate communication between relevant parties, and provide a more efficient workflow for handling university recognition processes.

The application follows the **ASP.NET Core MVC** architecture and includes support for multilingual interfaces, document handling, session management, and service-based business logic.

---

## ✨ Features

* 🏛️ University recognition request management
* 📋 Recognition request tracking and processing
* 👨‍💼 Academic advisor management
* 📅 Meeting management
* 📄 Document and file handling
* 📊 Excel file processing
* 🌐 Arabic and English localization
* 🔐 Session-based user management
* 🗂️ Structured MVC architecture
* 🧩 Service-based business logic
* 🗄️ PostgreSQL database support
* 💾 In-memory service implementation for development/testing
* 📱 Responsive web interface
* ⚡ Razor runtime compilation for faster development

---

## 🏗️ System Architecture

The application is built using **ASP.NET Core MVC** and follows a layered structure:

```text
┌───────────────────────────────┐
│           Web UI              │
│       Razor Views             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         Controllers           │
│   Handle HTTP Requests        │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           Services            │
│      Business Logic           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        Data / EF Core         │
│     PostgreSQL Database       │
└───────────────────────────────┘
```

The project also separates **DTOs** and service implementations into dedicated projects.

---

## 🛠️ Technologies Used

### Backend

* **ASP.NET Core MVC**
* **C#**
* **.NET 10**
* **Entity Framework Core**
* **PostgreSQL**
* **Npgsql**

### Frontend

* Razor Views
* HTML5
* CSS3
* JavaScript
* Bootstrap

### Additional Libraries

* **ClosedXML** — Excel file processing
* **Razor Runtime Compilation**
* ASP.NET Core Localization
* Entity Framework Core Tools
* Entity Framework Core Design

---

## 🌐 Localization

The system supports both:

* 🇬🇧 English
* 🇯🇴 Arabic

Arabic pages support **RTL (Right-to-Left)** layouts, while English uses **LTR (Left-to-Right)** layouts.

Localization is implemented using ASP.NET Core's localization infrastructure and resource files.

---

## 🗄️ Database

The system is designed to work with **PostgreSQL** using Entity Framework Core.

The project includes:

* Entity Framework Core models
* Database context
* Migrations
* PostgreSQL provider
* Database initialization support

For development and testing, the application currently supports **in-memory service implementations**, allowing the system to run without requiring a database connection.

The database configuration can be enabled through the application's service configuration.

---

## 📂 Project Structure

```text
MOHRecognition/
│
├── Controllers/
│   └── Application Controllers
│
├── Models/
│   └── Domain Models
│
├── DTOs/
│   └── Data Transfer Objects
│
├── Data/
│   └── Database Context & Data Access
│
├── Services/
│   └── Business Logic & Service Implementations
│
├── Views/
│   └── Razor Views
│
├── Resources/
│   └── Localization Resources
│
├── Infrastructure/
│   └── Localization Infrastructure
│
├── Migrations/
│   └── Entity Framework Migrations
│
├── wwwroot/
│   ├── css/
│   ├── js/
│   ├── uploads/
│   └── static assets
│
├── ArchiveService.cs/
│   └── Archive-related services
│
├── PdfReaderTool/
│   └── PDF processing utilities
│
├── Program.cs
├── appsettings.json
├── MOHRecognition.csproj
└── MOHRecognition.slnx
```

---

## ⚙️ Prerequisites

Before running the project, make sure you have:

* [.NET 10 SDK](https://dotnet.microsoft.com/)
* PostgreSQL *(required when using the database implementation)*
* Git
* Visual Studio 2022+ or another compatible .NET IDE

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ghena03/MOHRecognition.git
```

### 2. Navigate to the Project

```bash
cd MOHRecognition
```

### 3. Restore Dependencies

```bash
dotnet restore
```

### 4. Build the Project

```bash
dotnet build
```

### 5. Run the Application

```bash
dotnet run
```

The application will start using the configured ASP.NET Core environment.

---

## 🗄️ PostgreSQL Configuration

To use PostgreSQL instead of the in-memory implementation:

1. Create a PostgreSQL database.
2. Add the appropriate connection string to `appsettings.json`.
3. Configure Entity Framework Core to use PostgreSQL.
4. Enable the database service implementations.
5. Apply the migrations.

Example connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=MOHRecognition;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

Then apply migrations:

```bash
dotnet ef database update
```

> **Note:** Never commit real database passwords, API keys, or other secrets to the repository.

---

## 📊 Excel & Document Processing

The system includes functionality for working with administrative documents and Excel files.

**ClosedXML** is used for Excel processing, while the application also supports serving files such as:

* `.pdf`
* `.xlsx`
* `.xls`

Uploaded files can be stored under the application's `wwwroot/uploads/` directories.

---

## 🔄 Application Workflow

A typical recognition workflow can be represented as:

```text
User
  │
  ▼
Submit Recognition Request
  │
  ▼
Request Processing
  │
  ├──► Document Management
  │
  ├──► Advisor Assignment
  │
  └──► Meeting Management
          │
          ▼
      Review / Processing
          │
          ▼
      Recognition Decision
```

The service layer separates the application's business logic from the MVC controllers and views.

---

## 🔐 Session Management

The application uses ASP.NET Core session management to maintain user-related state during a session.

The configured session includes:

* HTTP-only cookies
* Essential cookies
* Two-hour idle timeout

This allows the application to maintain state across relevant requests while providing controlled session expiration.

---

## 🧪 Development

For development, the project supports Razor runtime compilation, allowing changes to Razor views to be reflected more quickly without requiring a complete application restart.

The project also contains separate service implementations for development/testing and database-backed operation.

---

## 🔮 Future Improvements

Potential future improvements include:

* Integration with the production PostgreSQL database
* Role-based access control
* Advanced authentication and authorization
* Email notifications
* Automated workflow notifications
* Advanced reporting dashboards
* Digital document verification
* Audit logging
* Advanced search and filtering
* AI-assisted document and recognition analysis
* Integration with external government/university systems
* Cloud deployment

---

## 🎓 Graduation Project

This project was developed as a **Computer Engineering Graduation Project** with the goal of developing a practical digital solution for managing university recognition and accreditation processes.

The project combines:

* Web application development
* Database management
* Software architecture
* Document processing
* Localization
* Business workflow automation

---

## 👩‍💻 Author

**Ghena Ali**

Computer Engineering Graduate
University of Jordan

GitHub: [@ghena03](https://github.com/ghena03)

---

## 📄 License

This project was developed for academic and educational purposes.

Please contact the repository owner before using or redistributing the system for production purposes.
