using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Runtime.Serialization.Json;
using Newtonsoft.Json;
using System.Data;

namespace ZuDash_API.requests
{
    public partial class adjustmentsReportDashboard : System.Web.UI.Page
    {
        DAL dal = new DAL();

        protected void Page_Load(object sender, EventArgs e)
        {
            string locationId = Request.QueryString["locationId"];
            string from = Request.QueryString["from"];
            string to = Request.QueryString["to"];
            Dictionary<string, object> error = new Dictionary<string, object>();
            if (locationId == "" || locationId == null)
            {
                error.Add("Error", "Unauthorized");
                Response.Write(JsonConvert.SerializeObject(error));
                return;
            }

            try
            {
                DataTable dt = new DataTable();
                if (from != null && to != null)
                {
                    DateTime fromDate = DateTime.Parse(from);
                    DateTime toDate = DateTime.Parse(to);

                    dt = dal.Adjustments_Report_Dashboard(Int32.Parse(locationId), fromDate, toDate);
                }
                else
                {
                    dt = dal.Adjustments_Report_Dashboard(Int32.Parse(locationId));
                };

                Response.Write(JsonConvert.SerializeObject(dt));
            }
            catch (Exception ex)
            {
                error.Add("Error", ex.Message); 
                Response.Write(JsonConvert.SerializeObject(error));
            }
        }
    }
}