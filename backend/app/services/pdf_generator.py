import io
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    Table,
    TableStyle,
    KeepTogether
)

class BasePDFTemplate(ABC):
    """
    Abstract Base Class for Resume PDF Templates.
    Allows easy addition of new templates in the future.
    """
    def __init__(self, content: Dict[str, Any], title: str = "Resume"):
        self.content = content or {}
        self.title = title
        self.personal_info = self.content.get("personal_info", {})
        self.summary = self.content.get("summary", "")
        self.education = self.content.get("education", [])
        self.skills = self.content.get("skills", [])
        self.experience = self.content.get("experience", [])
        self.projects = self.content.get("projects", [])
        self.certifications = self.content.get("certifications", [])
        self.achievements = self.content.get("achievements", [])
        self.social_links = self.content.get("social_links", [])

    @abstractmethod
    def build_flowables(self) -> List[Any]:
        """Generate list of ReportLab Flowables for this template."""
        pass


class ATSFriendlyPDFBuilder(BasePDFTemplate):
    """
    ATS-Friendly Resume Template:
    - Single-column high legibility
    - Standard hierarchy and clear horizontal line dividers
    - PostScript vector text stream for 100% parser indexability
    - KeepWithNext on headings to eliminate orphans
    """
    def build_flowables(self) -> List[Any]:
        flowables = []
        styles = getSampleStyleSheet()

        # Custom Typography Styles
        name_style = ParagraphStyle(
            'ATS_Name',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            alignment=1, # Center
            textColor=colors.HexColor('#111827'),
            spaceAfter=2
        )

        headline_style = ParagraphStyle(
            'ATS_Headline',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=14,
            alignment=1, # Center
            textColor=colors.HexColor('#374151'),
            spaceAfter=4
        )

        contact_style = ParagraphStyle(
            'ATS_Contact',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            alignment=1, # Center
            textColor=colors.HexColor('#4B5563'),
            spaceAfter=10
        )

        section_heading_style = ParagraphStyle(
            'ATS_Heading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#111827'),
            keepWithNext=True, # Prevents orphan headings at bottom of page
            spaceBefore=10,
            spaceAfter=3
        )

        body_style = ParagraphStyle(
            'ATS_Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=3
        )

        item_title_left = ParagraphStyle(
            'ATS_ItemTitleLeft',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#111827')
        )

        item_date_right = ParagraphStyle(
            'ATS_ItemDateRight',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            alignment=2, # Right
            textColor=colors.HexColor('#4B5563')
        )

        item_sub_left = ParagraphStyle(
            'ATS_ItemSubLeft',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#4B5563'),
            spaceAfter=2
        )

        bullet_style = ParagraphStyle(
            'ATS_Bullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            leftIndent=12,
            firstLineIndent=-8,
            textColor=colors.HexColor('#374151'),
            spaceAfter=2
        )

        # 1. Header & Contact Information
        full_name = self.personal_info.get("full_name") or "YOUR NAME"
        flowables.append(Paragraph(full_name.upper(), name_style))

        if self.personal_info.get("headline"):
            flowables.append(Paragraph(self.personal_info["headline"], headline_style))

        contact_parts = []
        if self.personal_info.get("location"):
            contact_parts.append(self.personal_info["location"])
        if self.personal_info.get("phone"):
            contact_parts.append(self.personal_info["phone"])
        if self.personal_info.get("email"):
            contact_parts.append(self.personal_info["email"])
        if self.personal_info.get("website"):
            contact_parts.append(self.personal_info["website"].replace("https://", "").replace("http://", ""))
        for s in self.social_links:
            if s.get("username"):
                contact_parts.append(s["username"])
            elif s.get("url"):
                contact_parts.append(s.get("platform", "Profile"))

        if contact_parts:
            flowables.append(Paragraph(" • ".join(contact_parts), contact_style))

        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1F2937'), spaceAfter=8))

        # 2. Professional Summary
        if self.summary:
            flowables.append(Paragraph("PROFESSIONAL SUMMARY", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9CA3AF'), spaceAfter=4))
            flowables.append(Paragraph(self.summary, body_style))
            flowables.append(Spacer(1, 4))

        # 3. Skills
        if self.skills:
            flowables.append(Paragraph("TECHNICAL SKILLS", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9CA3AF'), spaceAfter=4))

            # Group skills by category
            categorized = {}
            for s in self.skills:
                cat = s.get("category") or "Technical"
                categorized.setdefault(cat, []).append(s.get("name", ""))

            for cat, names in categorized.items():
                line = f"<b>{cat}:</b> {', '.join(names)}"
                flowables.append(Paragraph(line, body_style))
            flowables.append(Spacer(1, 4))

        # 4. Work Experience
        if self.experience:
            flowables.append(Paragraph("WORK EXPERIENCE", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9CA3AF'), spaceAfter=4))

            for exp in self.experience:
                pos = exp.get("position") or "Position"
                comp = exp.get("company") or "Company"
                dates = f"{exp.get('start_date', '')} – {'Present' if exp.get('is_current') else exp.get('end_date', '')}"
                loc = exp.get("location", "")

                header_table = Table(
                    [[
                        Paragraph(f"<b>{pos}</b> — {comp}", item_title_left),
                        Paragraph(dates, item_date_right)
                    ]],
                    colWidths=[400, 140]
                )
                header_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                ]))

                exp_block = [header_table]
                if loc:
                    exp_block.append(Paragraph(loc, item_sub_left))

                desc = exp.get("description", "")
                if desc:
                    lines = desc.split("\n")
                    for l in lines:
                        clean_line = l.strip()
                        if clean_line:
                            if not clean_line.startswith("•") and not clean_line.startswith("-"):
                                clean_line = f"• {clean_line}"
                            exp_block.append(Paragraph(clean_line, bullet_style))

                exp_block.append(Spacer(1, 4))
                # Keep individual experience item together if reasonably sized
                flowables.append(KeepTogether(exp_block))

        # 5. Key Projects
        if self.projects:
            flowables.append(Paragraph("PROJECTS", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9CA3AF'), spaceAfter=4))

            for proj in self.projects:
                p_title = proj.get("title") or "Project"
                role = proj.get("role", "")
                dates = f"{proj.get('start_date', '')} – {proj.get('end_date', '')}".strip(" –")

                title_text = f"<b>{p_title}</b>" + (f" | <i>{role}</i>" if role else "")
                header_table = Table(
                    [[
                        Paragraph(title_text, item_title_left),
                        Paragraph(dates, item_date_right)
                    ]],
                    colWidths=[400, 140]
                )
                header_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                ]))

                proj_block = [header_table]
                if proj.get("tech_stack"):
                    proj_block.append(Paragraph(f"<b>Technologies:</b> {proj['tech_stack']}", item_sub_left))

                desc = proj.get("description", "")
                if desc:
                    lines = desc.split("\n")
                    for l in lines:
                        clean_line = l.strip()
                        if clean_line:
                            if not clean_line.startswith("•") and not clean_line.startswith("-"):
                                clean_line = f"• {clean_line}"
                            proj_block.append(Paragraph(clean_line, bullet_style))

                proj_block.append(Spacer(1, 4))
                flowables.append(KeepTogether(proj_block))

        # 6. Education
        if self.education:
            flowables.append(Paragraph("EDUCATION", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9CA3AF'), spaceAfter=4))

            for edu in self.education:
                school = edu.get("school") or "University"
                dates = f"{edu.get('start_date', '')} – {edu.get('end_date', '')}".strip(" –")
                deg = edu.get("degree", "")
                field = edu.get("field_of_study", "")
                deg_full = f"{deg} in {field}" if deg and field else (deg or field)

                header_table = Table(
                    [[
                        Paragraph(f"<b>{school}</b>", item_title_left),
                        Paragraph(dates, item_date_right)
                    ]],
                    colWidths=[400, 140]
                )
                header_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                ]))

                edu_block = [header_table]
                sub_parts = []
                if deg_full:
                    sub_parts.append(deg_full)
                if edu.get("gpa"):
                    sub_parts.append(f"GPA: {edu['gpa']}")

                if sub_parts:
                    edu_block.append(Paragraph(" | ".join(sub_parts), item_sub_left))

                if edu.get("description"):
                    edu_block.append(Paragraph(edu["description"], bullet_style))

                edu_block.append(Spacer(1, 4))
                flowables.append(KeepTogether(edu_block))

        # 7. Certifications & Achievements
        if self.certifications or self.achievements:
            flowables.append(Paragraph("CERTIFICATIONS & HONORS", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9CA3AF'), spaceAfter=4))

            for cert in self.certifications:
                name = cert.get("name", "")
                iss = cert.get("issuer", "")
                dt = cert.get("issue_date", "")
                cert_text = f"• <b>{name}</b>" + (f" — {iss}" if iss else "") + (f" ({dt})" if dt else "")
                flowables.append(Paragraph(cert_text, bullet_style))

            for ach in self.achievements:
                title = ach.get("title", "")
                dt = ach.get("date", "")
                desc = ach.get("description", "")
                ach_text = f"• <b>{title}</b>" + (f" ({dt})" if dt else "") + (f": {desc}" if desc else "")
                flowables.append(Paragraph(ach_text, bullet_style))

        return flowables


class ModernProfessionalPDFBuilder(BasePDFTemplate):
    """
    Modern Professional Resume Template:
    - Executive styled header with indigo accents
    - Elegant typography and metadata badges
    - Clean horizontal rules and section icons
    - Supports dynamic multi-page flow without clipping
    """
    def build_flowables(self) -> List[Any]:
        flowables = []
        styles = getSampleStyleSheet()

        # Styles with modern indigo palette
        name_style = ParagraphStyle(
            'Modern_Name',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=2
        )

        headline_style = ParagraphStyle(
            'Modern_Headline',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#4F46E5'), # Indigo 600
            spaceAfter=4
        )

        contact_style = ParagraphStyle(
            'Modern_Contact',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11.5,
            alignment=2, # Right
            textColor=colors.HexColor('#475569')
        )

        section_heading_style = ParagraphStyle(
            'Modern_Heading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#1E1B4B'), # Deep indigo
            keepWithNext=True,
            spaceBefore=10,
            spaceAfter=3
        )

        body_style = ParagraphStyle(
            'Modern_Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#334155'),
            spaceAfter=3
        )

        item_title = ParagraphStyle(
            'Modern_ItemTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#0F172A')
        )

        item_date = ParagraphStyle(
            'Modern_ItemDate',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=12,
            alignment=2,
            textColor=colors.HexColor('#4F46E5')
        )

        item_sub = ParagraphStyle(
            'Modern_ItemSub',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11.5,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=2
        )

        bullet_style = ParagraphStyle(
            'Modern_Bullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            leftIndent=10,
            firstLineIndent=-6,
            textColor=colors.HexColor('#334155'),
            spaceAfter=2
        )

        # 1. Executive Modern Header (2-Column Banner)
        full_name = self.personal_info.get("full_name") or "Your Name"
        headline = self.personal_info.get("headline") or ""

        left_header = [Paragraph(full_name, name_style)]
        if headline:
            left_header.append(Paragraph(headline, headline_style))

        contact_lines = []
        if self.personal_info.get("email"):
            contact_lines.append(f"✉ {self.personal_info['email']}")
        if self.personal_info.get("phone"):
            contact_lines.append(f"☎ {self.personal_info['phone']}")
        if self.personal_info.get("location"):
            contact_lines.append(f"⌖ {self.personal_info['location']}")
        if self.personal_info.get("website"):
            contact_lines.append(f"🌐 {self.personal_info['website'].replace('https://', '')}")

        right_header = [Paragraph("<br/>".join(contact_lines), contact_style)]

        header_table = Table(
            [[left_header, right_header]],
            colWidths=[330, 210]
        )
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        flowables.append(header_table)

        # Indigo accent bar under header
        flowables.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#4F46E5'), spaceAfter=8))

        # 2. Executive Profile / Summary
        if self.summary:
            flowables.append(Paragraph("EXECUTIVE PROFILE", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E0E7FF'), spaceAfter=4))
            flowables.append(Paragraph(self.summary, body_style))
            flowables.append(Spacer(1, 4))

        # 3. Work Experience
        if self.experience:
            flowables.append(Paragraph("WORK EXPERIENCE", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E0E7FF'), spaceAfter=4))

            for exp in self.experience:
                pos = exp.get("position") or "Position"
                comp = exp.get("company") or "Company"
                dates = f"{exp.get('start_date', '')} – {'Present' if exp.get('is_current') else exp.get('end_date', '')}"
                loc = exp.get("location", "")

                t_table = Table(
                    [[
                        Paragraph(f"<b>{pos}</b> — <font color='#475569'>{comp}</font>", item_title),
                        Paragraph(dates, item_date)
                    ]],
                    colWidths=[390, 150]
                )
                t_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                ]))

                block = [t_table]
                if loc:
                    block.append(Paragraph(loc, item_sub))

                desc = exp.get("description", "")
                if desc:
                    lines = desc.split("\n")
                    for l in lines:
                        clean_line = l.strip()
                        if clean_line:
                            if not clean_line.startswith("•") and not clean_line.startswith("-"):
                                clean_line = f"• {clean_line}"
                            block.append(Paragraph(clean_line, bullet_style))

                block.append(Spacer(1, 4))
                flowables.append(KeepTogether(block))

        # 4. Featured Projects
        if self.projects:
            flowables.append(Paragraph("FEATURED PROJECTS", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E0E7FF'), spaceAfter=4))

            for proj in self.projects:
                p_title = proj.get("title") or "Project"
                role = proj.get("role", "")
                dates = f"{proj.get('start_date', '')} – {proj.get('end_date', '')}".strip(" –")

                title_text = f"<b>{p_title}</b>" + (f" ({role})" if role else "")
                t_table = Table(
                    [[
                        Paragraph(title_text, item_title),
                        Paragraph(dates, item_date)
                    ]],
                    colWidths=[390, 150]
                )
                t_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                ]))

                block = [t_table]
                if proj.get("tech_stack"):
                    block.append(Paragraph(f"<b>Technologies:</b> {proj['tech_stack']}", item_sub))

                desc = proj.get("description", "")
                if desc:
                    lines = desc.split("\n")
                    for l in lines:
                        clean_line = l.strip()
                        if clean_line:
                            if not clean_line.startswith("•") and not clean_line.startswith("-"):
                                clean_line = f"• {clean_line}"
                            block.append(Paragraph(clean_line, bullet_style))

                block.append(Spacer(1, 4))
                flowables.append(KeepTogether(block))

        # 5. Core Competencies
        if self.skills:
            flowables.append(Paragraph("CORE COMPETENCIES", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E0E7FF'), spaceAfter=4))

            # Group skills
            categorized = {}
            for s in self.skills:
                cat = s.get("category") or "Technical"
                categorized.setdefault(cat, []).append(s.get("name", ""))

            for cat, names in categorized.items():
                line = f"<b>{cat}:</b> {', '.join(names)}"
                flowables.append(Paragraph(line, body_style))
            flowables.append(Spacer(1, 4))

        # 6. Education
        if self.education:
            flowables.append(Paragraph("EDUCATION", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E0E7FF'), spaceAfter=4))

            for edu in self.education:
                school = edu.get("school") or "University"
                dates = f"{edu.get('start_date', '')} – {edu.get('end_date', '')}".strip(" –")
                deg = edu.get("degree", "")
                field = edu.get("field_of_study", "")
                deg_full = f"{deg} in {field}" if deg and field else (deg or field)

                t_table = Table(
                    [[
                        Paragraph(f"<b>{school}</b>", item_title),
                        Paragraph(dates, item_date)
                    ]],
                    colWidths=[390, 150]
                )
                t_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                ]))

                block = [t_table]
                sub_parts = []
                if deg_full:
                    sub_parts.append(deg_full)
                if edu.get("gpa"):
                    sub_parts.append(f"GPA: {edu['gpa']}")

                if sub_parts:
                    block.append(Paragraph(" | ".join(sub_parts), item_sub))

                if edu.get("description"):
                    block.append(Paragraph(edu["description"], bullet_style))

                block.append(Spacer(1, 4))
                flowables.append(KeepTogether(block))

        # 7. Credentials & Honors
        if self.certifications or self.achievements:
            flowables.append(Paragraph("CREDENTIALS & HONORS", section_heading_style))
            flowables.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#E0E7FF'), spaceAfter=4))

            for cert in self.certifications:
                name = cert.get("name", "")
                iss = cert.get("issuer", "")
                dt = cert.get("issue_date", "")
                cert_text = f"• <b>{name}</b>" + (f" — {iss}" if iss else "") + (f" ({dt})" if dt else "")
                flowables.append(Paragraph(cert_text, bullet_style))

            for ach in self.achievements:
                title = ach.get("title", "")
                dt = ach.get("date", "")
                desc = ach.get("description", "")
                ach_text = f"• <b>{title}</b>" + (f" ({dt})" if dt else "") + (f": {desc}" if desc else "")
                flowables.append(Paragraph(ach_text, bullet_style))

        return flowables


def generate_resume_pdf(content: Dict[str, Any], template_id: str = "ats-friendly", title: str = "Resume") -> bytes:
    """
    Main PDF generation pipeline:
    - Instantiates the appropriate template builder strategy
    - Configures page size, professional margins (0.5 inch / 36 pt)
    - Compiles flowables with intelligent page break budgeting
    - Returns pure binary PDF byte stream
    """
    buffer = io.BytesIO()

    # Document setup with standard Letter dimensions and clean 0.5-inch margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
        title=title or "Resume",
        author=content.get("personal_info", {}).get("full_name", "CareerAI")
    )

    # Modular Template Strategy Selection
    template_builders = {
        "ats-friendly": ATSFriendlyPDFBuilder,
        "modern-professional": ModernProfessionalPDFBuilder
    }

    builder_class = template_builders.get(template_id, ATSFriendlyPDFBuilder)
    builder = builder_class(content=content, title=title)
    flowables = builder.build_flowables()

    # Build PDF document
    doc.build(flowables)

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
