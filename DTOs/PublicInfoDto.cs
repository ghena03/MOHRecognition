using System;
using System.Collections.Generic;
using System.Text;

namespace DTOs;

public class PublicInfoDto
{


    public string InstitutionName { get; set; } = "";

    // UI: "Party Forwarding Form" (instead of ReportSubmittedBy label)
    public string PartyForwardingForm { get; set; } = "";

    // Dates
    public string FoundationDate { get; set; } = "";
    public string DateOfEstablishment { get; set; } = "";
    public string StartOfTeaching { get; set; } = ""; // UI: Start of Teaching (Conventional and Non-Conventional)

    public string City { get; set; } = "";

    // Study mode / language
    public string ModeOfStudy { get; set; } = "";
    public string LanguageOfInstruction { get; set; } = "";
    public string LanguageOfInstructionOther { get; set; } = "";

    // UI: "Official Entity Possessing Oversight Rights"
    public string OversightRightsEntity { get; set; } = "";

    // President of Institution
    public string PresidentName { get; set; } = "";
    public string PresidentHighestAcademicDegree { get; set; } = "";
    public string PresidentMajorAreaOfStudy { get; set; } = "";

    // Contact Information
    public string MailingFullAddress { get; set; } = "";
    public string DirectPhoneNumber { get; set; } = "";
    public string FaxNumber { get; set; } = "";
    public string EmailAddress { get; set; } = "";
    public string InstitutionalWebAddress { get; set; } = "";
    public string LastDateWebsiteUpdated { get; set; } = "";

    // Identity
    public string InstitutionalVisionStatement { get; set; } = "";
    public string InstitutionalMissionStatement { get; set; } = "";
    public string InstitutionalTargettedObjectives { get; set; } = "";
    public string InstitutionalValues { get; set; } = "";





}
