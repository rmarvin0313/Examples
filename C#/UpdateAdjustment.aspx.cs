using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Runtime.Serialization.Json;
using Newtonsoft.Json;

namespace ZuDash_API.alterations
{
    public partial class UpdateAdjustment : System.Web.UI.Page
    {
        DAL data = new DAL();
        protected void Page_Load(object sender, EventArgs e)
        {
            string adj = Request.Form["data"];
            string wmsId = Request.Form["wmsId"];
                
            Dictionary<string, object> response = new Dictionary<string, object>();

            if (wmsId == "" || wmsId == null || adj == "" || adj == null)
            {
                response.Add("Error", "Unauthorized");
            }
            else
            {
                try 
	            {
                    int id = data.UpdateAdjustment(adj, Int32.Parse(wmsId));
                    response.Add("Success", "Successfully updated adjustment id " + id.ToString() + ".");
	            }
	            catch (Exception ex  )
	            {
                    response.Add("Error", ex.Message);
	            }
            };

            Response.Write(JsonConvert.SerializeObject(response));
        }
    }
}