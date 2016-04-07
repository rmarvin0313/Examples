using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Net.Mail;
using System.Globalization;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace RecurringJobs
{
    class FCPendingHRForms
    {
        DAL data = new DAL();

        FCCreateHRForm FCCreateHRForm = new FCCreateHRForm();

        public void Pending()
        {
            DataTable dt = data.PendingHRForms();

            List<int> ids = new List<int>();

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    ids.Add((int)row[0]);

                    Dictionary<string, dynamic> line = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(row[1].ToString());

                    if ((int)row[2] == 10)
                    {
                        data.InsertIntoHFTable(line);
                    }
                    else
                    {
                        FCCreateHRForm.Create(line, (int)row[2], row[3].ToString());
                    };

                };
                    
                foreach (int id in ids)
                {
                    data.UpdatedPendingHrForms(id);
                };
            }
        }
    }
}
