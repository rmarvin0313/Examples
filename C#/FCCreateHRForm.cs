using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using SelectPdf;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace RecurringJobs
{
    public class FCCreateHRForm
    {
        NewGraph NewGraph = new NewGraph();
        DAL dal = new DAL();
        public void Create(Dictionary<string, dynamic> data, int caId, string caName)
        {
            Dictionary<string, dynamic> title = new Dictionary<string, dynamic>()
            {
                {"Title", "UPH Trend"},
                {"Font", "Microsoft Sans Serif"},
                {"Size", 15}
            };

            Dictionary<string, dynamic> seriesData = new Dictionary<string, dynamic>()
            {
                {"UPH", new Dictionary<string, dynamic>() 
                    {
                        {"type", "Line"},
                        {"labels", true},
                        {"hasGoal", true},
                        {"goal", double.Parse(data["uph_goal"].ToString())},
                        {"width", 3},
                        {"trend", true},
                        {"data", new List<double>()}
                    }
                }
            };

            for (int i = 0; i < 4; i++)
            {
                if (data["weeks"][i.ToString()] != null)
                {
                double uph = double.Parse(data["weeks"][i.ToString()]["uph"].ToString("#.###"));
                seriesData["UPH"]["data"].Add(uph);
                }
                else
                {
                    seriesData["UPH"]["data"].Add(0.00);
                }
            };

            List<double> dataForMin = seriesData["UPH"]["data"];

            List<string> yAxisText = new List<string>()
            {
                "Week 1", "Week 2", "Week 3", "Week 4"
            };

            decimal minY = (decimal)dataForMin.Min();

            string uphChart = NewGraph.Create(title, 330, 780, seriesData, yAxisText, decimal.Truncate(minY));

            #region CAPIP
            string CAPIP = @"
                <html>

                <head>
                    <style>
                    body {
                        font-family: 'Calibri', Serif;
                        text-align: center;
                    }
    
                    .container {
                        text-align: center;
                        width: 100%;
                        height: 100%;
                        padding: 20px;
                    }
    
                    .zLogo {
                        display: inline-block;
                        vertical-align: top;
                        height: 90px;
                    }
    
                    .iLogo {
                        display: inline-block;
                        vertical-align: top;
                        width: 138px;
                    }
    
                    .pageTop {
                        border: 1px solid #000;
                        vertical-align: top;
                        width: 75%;
                        margin-top: 20px;
                        height: 40px;
                        display: inline-block;
                        font-weight: bold;
                        font-size: 30px;
                    }
    
                    h2 {
                        margin: 0!important;
                    }
    
                    table {
                        border-collapse: collapse;
                        width: 984px;
                    }
    
                    td {
                        border: 1px solid #000;
                        text-align: center;
                        padding-left: 5px;
                    }
    
                    .hCell {
                        text-align: left;
                        font-weight: bold;
                    }
    
                    .italics {
                        font-style: italic;
                    }
    
                    .align-left {
                        text-align: left;
                    }
    
                    tr {
                        height: 22px;
                    }
    
                    .cCell_NoBorder {
                        border: 0 !important;
                    }
    
                    .cCell_NoBTBorder {
                        border-top: 0;
                        border-bottom: 0;
                    }
    
                    .cCell_NoBTRBorder {
                        border-top: 0;
                        border-bottom: 0;
                        border-right: 0;
                    }
    
                    .cCell_NoBTLBorder {
                        border-top: 0;
                        border-bottom: 0;
                        border-left: 0;
                    }
                    </style>
                </head>

                <body>
                    <div class='container'>
                        <img class='" + (data["employer"].ToString() == "Zulily" ? "zLogo" : "iLogo") + @"' src='" + (data["employer"].ToString() == "Zulily" ? "http://zuportal.corp.zulily.com/desktop/css/images/zulily_logo.png" : "http://zuportal.corp.zulily.com/desktop/css/images/intellisource_logo.png") + @"' />
                        <div class='pageTop'>
                            Productivity Improvement Plan
                        </div>
                        <table>
                            <tbody>
                                <tr>
                                    <td class='hCell' style='width: 246px'>Associate Name:</td>
                                    <td style='width: 246px'>" + data["fullName"].ToString() + @"</td>
                                    <td class='hCell' style='width: 246px'>Dept/Shift:</td>
                                    <td style='width: 246px'>" + data["dept"].ToString() + "/ " + data["shift"].ToString() + @"</td>
                                </tr>
                                <tr>
                                    <td class='hCell' style='width: 246px'>Production Area:</td>
                                    <td style='width: 246px'>" + data["operation"].ToString() + @"</td>
                                    <td class='hCell' style='width: 246px'>Date of Hire:</td>
                                    <td style='width: 246px'>" + DateTime.Parse(data["hireDate"].ToString()).ToString("MM/dd/yyyy") + @"</td>
                                </tr>
                                <tr>
                                    <td class='hCell' style='width: 246px'>Manager's Name:</td>
                                    <td style='width: 246px'>" + data["managerName"].ToString() + @"</td>
                                    <td class='hCell' style='width: 246px'>Associate ID #</td>
                                    <td style='width: 246px'>" + data["kronosId"].ToString() + @"</td>
                                </tr>
                                <tr>
                                    <td class='hCell' style='width: 246px' colspan='2' rowspan='2' valign='top'>
                                        Check One:
                                        <br>
                                        <div style='display: inline-block;'>
                                            <input type='checkbox' " + (caId == 2 ? "checked" : "") + @"/> 1st Written Warning
                                        </div>
                                        <div style='display: inline-block;'>
                                            <input type='checkbox' " + (caId == 3 ? "checked" : "") + @"/> 2nd Written Warning
                                        </div>
                                        <div style='display: inline-block;'>
                                            <input type='checkbox' " + (caId == 4 ? "checked" : "") + @"/> Final Warning
                                        </div>
                                        <div style='display: inline-block;'>
                                            <input type='checkbox' " + (caId == 5 ? "checked" : "") + @"/> Notice of Termination
                                        </div>
                                    </td>
                                    <td class='hCell' style='width: 246px' colspan='2' rowspan='2'>
                                        <div>
                                            1st Written Warning Date: " + (caId == 2 ? "_______<u>" + DateTime.Now.ToString("MM/dd/yyyy") + "</u>_______" : "________________________") + @"
                                        </div>
                                        <div>
                                            2nd Written Warning Date: " + (caId == 3 ? "_______<u>" + DateTime.Now.ToString("MM/dd/yyyy") + "</u>_______" : "________________________") + @"
                                        </div>
                                        <div>
                                            Final Warning Date: " + (caId == 4 ? "_______<u>" + DateTime.Now.ToString("MM/dd/yyyy") + "</u>_______" : "________________________") + @"
                                        </div>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='cCell_NoBorder italics align-left' colspan='4'>
                                        This notice is used for any level employee infractions involving misconduct. Examples of this may include, but are not limited to, failure to follow rules, policies, directions, safety standards and attendance guidelines. It is also used for gross misconduct that includes more serious violations of company standards and procedures, which may result in expedited disciplinary action. Nothing in this document should in any way be construed as altering your status as an 'at will' associate.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <tbody>
                                <tr>
                                    <td style='width: 328px' rowspan='2' valign='top'>
                                        <h2>
                                            Performance
                                        </h2>
                                        <div style='margin-left: 33%' class='align-left'>
                                            <div>
                                                <input type='checkbox' checked/> Productivity
                                            </div>
                                        </div>
                                    </td>
                                    <td style='width: 328px' rowspan='2' valign='top'>
                                        <h2>
                                            Point of Concern
                                        </h2>
                                        <div style='margin-left: 15%' class='align-left'>
                                            <div>
                                                <input type='checkbox' checked/> Failure to meet UPH expectations
                                            </div>
                                        </div>
                                    </td>
                                    <td style='width: 328px' rowspan='2' valign='top'>
                                        <h2>
                                            Eligibility Period
                                        </h2>
                                        <div style='margin-left: 15%' class='align-left'>
                                            <div>
                                                <input type='checkbox' " + (caId == 2 ? "checked" : "") + @"/> 60 days (1st Written Warning)
                                            </div>
                                            <div>
                                                <input type='checkbox' " + (caId == 3 ? "checked" : "") + @"/> 90 days (2nd Written Warning)
                                            </div>
                                            <div>
                                                <input type='checkbox' " + (caId == 4 ? "checked" : "") + @"/> 90 days (Final Warning)
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' colspan='3'>
                                        <strong>Summary of Concern</strong> (Including Impact to the business) :
                                    </td>
                                </tr>
                                <tr>
                                    <td class='hCell' style='border-bottom: 0 !important;' colspan='3'>
                                        Associate did not meet the minimum expectation for the week of " + DateTime.Parse(data["reviewWeekDate"].ToString()).ToString("MM/dd/yyyy") + @" to " + DateTime.Parse(data["reviewWeekDate"].ToString()).AddDays(6).ToString("MM/dd/yyyy") + @"
                                    </td>
                                </tr>
                                <tr>
                                    <td style='width: 328px' class='cCell_NoBTRBorder hCell' rowspan='2'>
                                        UPH Goal: <u><strong>" + data["uph_goal"].ToString() + @"</strong></u>
                                    </td>
                                    <td style='width: 328px' class='cCell_NoBorder hCell' rowspan='2'>
                                        UPH Actual: <u><strong>" + data["weeks"]["3"]["uph"].ToString("#.##") + @"</strong></u>
                                    </td>
                                    <td style='width: 328px' class='cCell_NoBTLBorder hCell' rowspan='2'>
                                        Percent To Goal: <u><strong>" + double.Parse(((double)(data["weeks"]["3"]["uph"] / (double)(data["uph_goal"])) * 100).ToString("#.##")) + @"%</strong></u>
                                    </td>
                                </tr>
                                <tr></tr>
                            </tbody>
                        </table>
                        <table>
                            <tbody>
                                <tr>
                                    <td style='width: 200px' valign='middle'>
                                        4 Week Avg UPH: <u><strong>" + data["fourWeek"]["uph"].ToString("#.##") + @"</strong></u>
                                    </td>
                                    <td style='width: 784px' colspan='3' valign='middle'>
                                        <img src='" + uphChart + @"'>
                                    </td>
                                </tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' colspan='4'>
                                        <strong>Expectations for Improvement:</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td class='align-left' rowspan='2' colspan='4'>
                                        Associates are expected to meet or exceed production goals at all times. If the associate is having trouble meeting this minimum job expectation, he/she should immediately partner with his/her manager for additional training and/or guidance.
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' colspan='4'>
                                        <strong>Time period allotted for improvement:</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td class='align-left' rowspan='2' colspan='4'>
                                        Immediate and ongoing
                                        <br> Employee is expected to comply with all policies and rules moving forward. Failure to maintain expected production goals, or comply with zulily standards and expectations, will result in additional disciplinary action, up to and including termination of employment.
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' rowspan='2' colspan='4' valign='middle'>
                                        <div style='width: 700px; display: inline-block;'>
                                            <strong>Supervisor Signature: _________________________________</strong>
                                        </div>
                                        <div style='display: inline-block;'>
                                            <strong>Date: __________________</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left' rowspan='5' colspan='4' valign='top'>
                                        <strong>Associate Comments</strong>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr>
                                    <td class='cCell_NoBorder italics align-left' colspan='4'>
                                        By signing this form, you confirm that you have read and completely understand the information in this warning. You also confirm that you and your manager have discussed the warning and plan for improvement, and you are aware that this form will be placed in my personnel file. Signing this form does not necessarily indicate that you agree with this warning.
                                    </td>
                                </tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' rowspan='2' colspan='4' valign='middle'>
                                        <div style='width: 700px; display: inline-block;'>
                                            <strong>Associate Signature: _________________________________</strong>
                                        </div>
                                        <div style='display: inline-block;'>
                                            <strong>Date: __________________</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' colspan='4' valign='middle'>
                                        <div style='width: 700px; display: inline-block;'>
                                            <strong>Witness Signature: _________________________________</strong>
                                        </div>
                                        <div style='display: inline-block;'>
                                            <strong>Date: __________________</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class='cCell_NoBorder italics align-left' colspan='4'>
                                        (if associate understands warning but refuses to sign)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </body>

                </html>
            ";

            #endregion

            #region CAVerbal

            string CAVerbal = @"
                <html>

                <head>
                    <style>
                    body {
                        font-family: 'Calibri', Serif;
                        text-align: center;
                    }
    
                    .container {
                        text-align: center;
                        width: 100%;
                        height: 100%;
                        padding: 20px;
                    }
    
                    .zLogo {
                        display: inline-block;
                        vertical-align: top;
                        height: 90px;
                    }
    
                    .iLogo {
                        display: inline-block;
                        vertical-align: top;
                        width: 138px;
                    }
    
                    .pageTop {
                        border: 1px solid #000;
                        vertical-align: top;
                        width: 75%;
                        margin-top: 20px;
                        height: 40px;
                        display: inline-block;
                        font-weight: bold;
                        font-size: 30px;
                    }
    
                    h2 {
                        margin: 0!important;
                    }
    
                    table {
                        border-collapse: collapse;
                        width: 984px;
                    }
    
                    td {
                        border: 1px solid #000;
                        text-align: center;
                        padding-left: 5px;
                    }
    
                    .hCell {
                        text-align: left;
                        font-weight: bold;
                    }
    
                    .italics {
                        font-style: italic;
                    }
    
                    .align-left {
                        text-align: left;
                    }
    
                    tr {
                        height: 22px;
                    }
    
                    .cCell_NoBorder {
                        border: 0 !important;
                    }
    
                    .cCell_NoBTBorder {
                        border-top: 0;
                        border-bottom: 0;
                    }
    
                    .cCell_NoBTRBorder {
                        border-top: 0;
                        border-bottom: 0;
                        border-right: 0;
                    }
    
                    .cCell_NoBTLBorder {
                        border-top: 0;
                        border-bottom: 0;
                        border-left: 0;
                    }
                    </style>
                </head>

                <body>
                    <div class='container'>
                        <img class='" + (data["employer"].ToString() == "Zulily" ? "zLogo" : "iLogo") + @"' src='" + (data["employer"].ToString() == "Zulily" ? "http://zuportal.corp.zulily.com/desktop/css/images/zulily_logo.png" : "http://zuportal.corp.zulily.com/desktop/css/images/intellisource_logo.png") + @"' />
                        <div class='pageTop'>
                            Employee Coaching Form
                        </div>
                        <table>
                            <tbody>
                                <tr>
                                    <td class='hCell' style='width: 246px'>Associate Name:</td>
                                    <td style='width: 246px'>" + data["fullName"].ToString() + @"</td>
                                    <td class='hCell' style='width: 246px'>Dept/Shift:</td>
                                    <td style='width: 246px'>" + data["dept"].ToString() + "/ " + data["shift"].ToString() + @"</td>
                                </tr>
                                <tr>
                                    <td class='hCell' style='width: 246px'>Production Area:</td>
                                    <td style='width: 246px'>" + data["operation"].ToString() + @"</td>
                                    <td class='hCell' style='width: 246px'>Date of Hire:</td>
                                    <td style='width: 246px'>" + DateTime.Parse(data["hireDate"].ToString()).ToString("MM/dd/yyyy") + @"</td>
                                </tr>
                                <tr>
                                    <td class='hCell' style='width: 246px'>Manager's Name:</td>
                                    <td style='width: 246px'>" + data["managerName"].ToString() + @"</td>
                                    <td class='hCell' style='width: 246px'>Associate ID #</td>
                                    <td style='width: 246px'>" + data["kronosId"].ToString() + @"</td>
                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <tbody>
                                <tr>
                                    <td style='width: 328px' rowspan='2' valign='top'>
                                        <h2>
                                            Performance
                                        </h2>
                                        <div style='margin-left: 33%' class='align-left'>
                                            <div>
                                                <input type='checkbox' checked/> Productivity
                                            </div>
                                        </div>
                                    </td>
                                    <td style='width: 328px' rowspan='2' valign='top'>
                                        <h2>
                                            Point of Concern
                                        </h2>
                                        <div style='margin-left: 15%' class='align-left'>
                                            <div>
                                                <input type='checkbox' checked/> UPH is trending unfavorably week over week
                                            </div>
                                        </div>
                                    </td>
                                    <td style='width: 328px' rowspan='2' valign='top'>
                                        <h2>
                                            Coach Date
                                        </h2> _________________________
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td class='hCell' style='border-bottom: 0 !important;' colspan='3'>
                                        <p><strong>Associates need to meet, or exceed, the minimum UPH, listed below, weekly.</strong></p>
                                        <p><strong>Point of Concern:</strong></p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <tbody>
                                <tr>
                                    <td style='width: 328px' class='cCell_NoBTRBorder hCell' rowspan='2'>
                                        Week 4 UPH Goal: <u><strong>" + data["weeks"]["3"]["uph_goal"].ToString("#.##") + @"</strong></u>
                                    </td>
                                    <td style='width: 328px' class='cCell_NoBorder hCell' rowspan='2'>
                                        Week 4 UPH Actual: <u><strong>" + data["weeks"]["3"]["uph"].ToString("#.##") + @"</strong></u>
                                    </td>
                                    <td style='width: 328px' class='cCell_NoBorder hCell' rowspan='2'>
                                        4 Week UPH Goal: <u><strong>" + data["fourWeek"]["uph_goal"].ToString("#.##") + @"</strong></u>
                                    </td>
                                    <td style='width: 328px' class='cCell_NoBTLBorder hCell' rowspan='2'>
                                        4 Week UPH Actual: <u><strong>" + data["fourWeek"]["uph"].ToString("#.##") + @"</strong></u>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <td style='width: 200px' valign='middle'>
                                        4 Week Avg UPH: <u><strong>" + data["fourWeek"]["uph"].ToString("#.##") + @"</strong></u>
                                    </td>
                                    <td style='width: 784px' colspan='3' valign='middle'>
                                        <img src='" + uphChart + @"'>
                                    </td>
                                </tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' colspan='4'>
                                        <strong>Expectations:</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td class='align-left' rowspan='2' colspan='4'>
                                        Associates are expected to meet or exceed production goals at all times. If the associate is having trouble meeting this minimum job expectation, he/she should immediately partner with his/her manager for additional training and/or guidance.
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left' rowspan='8' colspan='4' valign='top'>
                                        <strong>Associate Comments/ Additional Training Requests:</strong>
                                    </td>
                                </tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr></tr>
                                <tr>
                                    <td class='align-left cCell_NoBorder' rowspan='2' colspan='4' valign='middle'>
                                        <div style='width: 700px; display: inline-block;'>
                                            <strong>Associate Initials: _________________________________</strong>
                                        </div>
                                        <div style='display: inline-block;'>
                                            <strong>Date: __________________</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr></tr>
                            </tbody>
                        </table>
                    </div>
                </body>

                </html>
                ";

            #endregion

            if (caId == 100)
            {
                int hrFormDataId = dal.InsertIntoHRFormData(data, caId);

                createFeedback(CAPIP, hrFormDataId.ToString() + "-" + data["wmsId"].ToString());
            }
            else
            {
                int hrFormDataId = dal.InsertIntoHRFormData(data, caId);

                createFeedback(CAVerbal, hrFormDataId.ToString() + "-" + data["wmsId"].ToString());
            };

        }

        public Dictionary<string, string> createFeedback(string html, string fileName)
        {

            string pdf_page_size = "A4";
            PdfPageSize pageSize = (PdfPageSize)Enum.Parse(typeof(PdfPageSize),
                pdf_page_size, true);

            string pdf_orientation = "Portrait";
            PdfPageOrientation pdfOrientation =
                (PdfPageOrientation)Enum.Parse(typeof(PdfPageOrientation),
                pdf_orientation, true);

            int webPageWidth = 1024;

            int webPageHeight = 1400;

            // instantiate a html to pdf converter object
            HtmlToPdf converter = new HtmlToPdf();
            // set converter options
            converter.Options.PdfPageSize = pageSize;
            converter.Options.PdfPageOrientation = pdfOrientation;
            converter.Options.WebPageWidth = webPageWidth;
            converter.Options.WebPageHeight = webPageHeight;

            // create a new pdf document converting an url
            PdfDocument doc = converter.ConvertHtmlString(html);

            // save pdf document
            //string fullFileName = "D:\\inetpub\\wwwroot\\api\\data\\pdf\\" + fileName + ".pdf";
            string fullFileName = "\\\\ful-seaweb-01\\d$\\inetpub\\wwwroot\\api\\data\\pdf\\" + fileName + ".pdf";
            doc.Save(fullFileName);

            // close pdf document
            doc.Close();

            return new Dictionary<string, string>()
            {

            };
        }
    }
}