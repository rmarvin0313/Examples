#region Adjustments

#region Gets

public DataTable Adjustments_Report_Dashboard(int locationId)
{
    DataTable table = new DataTable();
    using (MySqlConnection conn = new MySqlConnection(connStr))
    {
        conn.Open();
        MySqlCommand cmd = new MySqlCommand(@"
            SELECT 
                a.adjustId AS id,
                k.wmsId AS adjustedByWmsId,
                k.fullName AS adjustedByName,
                CONCAT('http://zuportal.corp.zulily.com/images/',
	                    a.locationId,
	                    '/',
	                    k.username,
	                    '.jpg') AS picLink,
                a.vendorName AS vendor,
                CASE
                    WHEN LEFT(a.container, 6) = 'RR00-0' THEN SUBSTRING_INDEX(a.container, ',', - 1)
                    WHEN LEFT(a.container, 6) != 'RR00-0' THEN SUBSTRING_INDEX(a.container, ',', 1)
                END AS container,
                a.containerType,
                a.wmsProductId,
                SUBSTRING_INDEX(a.productTitle, ' - ', 1) AS productTitle,
                a.conveyable,
                a.productSize,
                a.zulilyCost AS cost,
                CASE
                    WHEN SUBSTRING_INDEX(a.productCategory, '=>', 1) != '' THEN SUBSTRING_INDEX(a.productCategory, '=>', 1)
                    WHEN SUBSTRING_INDEX(a.productCategory, '=>', 1) = '' THEN 'Not Listed'
                END AS category,
                a.adjustQty,
                a.adjustNotes,
                IF(ISNULL(s.name), 0, 1) AS overThreshold,
                p.fullName as updatedBy,
                s.name AS status,
                r.ticketUrl,
                r.department,
                r.reason,
                r.comments,
                a.locationId
            FROM
                fc_adjustments a
                    LEFT JOIN
                zudb.fc_adjustments_reasons r ON r.adjustId = a.adjustId
                    LEFT JOIN
                fc_adjustments_status s ON r.status = s.id
                    LEFT JOIN
                kronosroster k ON a.adjustedBy = k.wmsId
                    AND a.locationId = k.locationId
                    LEFT JOIN
                kronosroster p ON r.updatedBy = p.wmsId
                    AND a.locationId = p.locationId
            WHERE
                a.locationId = @locationId
                    AND a.timeStamp BETWEEN DATE(DATE_SUB(NOW(), INTERVAL 48 HOUR)) AND NOW()", conn);
        cmd.CommandType = CommandType.Text;
        cmd.Parameters.AddWithValue("@locationId", locationId);
        table.Load(cmd.ExecuteReader());
        conn.Close();
    }
    return table;
}

public DataTable Adjustments_Report_Dashboard(int locationId, DateTime from, DateTime to)
{
    DataTable table = new DataTable();
    using (MySqlConnection conn = new MySqlConnection(connStr))
    {
        conn.Open();
        MySqlCommand cmd = new MySqlCommand(@"
            SELECT 
                a.adjustId AS id,
                k.wmsId AS adjustedByWmsId,
                k.fullName AS adjustedByName,
                CONCAT('http://zuportal.corp.zulily.com/images/',
	                    a.locationId,
	                    '/',
	                    k.username,
	                    '.jpg') AS picLink,
                a.vendorName AS vendor,
                CASE
                    WHEN LEFT(a.container, 6) = 'RR00-0' THEN SUBSTRING_INDEX(a.container, ',', - 1)
                    WHEN LEFT(a.container, 6) != 'RR00-0' THEN SUBSTRING_INDEX(a.container, ',', 1)
                END AS container,
                a.containerType,
                a.wmsProductId,
                SUBSTRING_INDEX(a.productTitle, ' - ', 1) AS productTitle,
                a.conveyable,
                a.productSize,
                a.zulilyCost AS cost,
                CASE
                    WHEN SUBSTRING_INDEX(a.productCategory, '=>', 1) != '' THEN SUBSTRING_INDEX(a.productCategory, '=>', 1)
                    WHEN SUBSTRING_INDEX(a.productCategory, '=>', 1) = '' THEN 'Not Listed'
                END AS category,
                a.adjustQty,
                a.adjustNotes,
                IF(ISNULL(s.name), 0, 1) AS overThreshold,
                p.fullName as updatedBy,
                s.name AS status,
                r.ticketUrl,
                r.department,
                r.reason,
                r.comments,
                a.locationId
            FROM
                fc_adjustments a
                    LEFT JOIN
                zudb.fc_adjustments_reasons r ON r.adjustId = a.adjustId
                    LEFT JOIN
                fc_adjustments_status s ON r.status = s.id
                    LEFT JOIN
                kronosroster k ON a.adjustedBy = k.wmsId
                    AND a.locationId = k.locationId
                    LEFT JOIN
                kronosroster p ON r.updatedBy = p.wmsId
                    AND a.locationId = p.locationId
            WHERE
                a.locationId = @locationId
                    AND a.timeStamp BETWEEN @fromDate AND @toDate", conn);
        cmd.CommandType = CommandType.Text;
        cmd.Parameters.AddWithValue("@locationId", locationId);
        cmd.Parameters.AddWithValue("@fromDate", from);
        cmd.Parameters.AddWithValue("@toDate", to);
        table.Load(cmd.ExecuteReader());
        conn.Close();
    }
    return table;
}

#endregion

#region Posts

public int UpdateAdjustment(string data, int wmsId)
{
    Dictionary<string, dynamic> adj = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(data);
    int ret = -1;
    using (MySqlConnection conn = new MySqlConnection(connStr))
    {
        conn.Open();
        Dictionary<string, int> statusIds = new Dictionary<string, int>()
        {
            {"Postponed", 1},
            {"Resolved", 2}
        };

        MySqlCommand cmd = new MySqlCommand(@"
            UPDATE fc_adjustments_reasons 
            SET 
                status = @status,
                ticketUrl = @ticketUrl,
                department = @department,
                reason = @reason,
                comments = @comments,
                updatedBy = @updatedBy
            WHERE
                adjustId = @adjustId
            ", conn);
        cmd.CommandType = CommandType.Text;
        cmd.Parameters.AddWithValue("@status", statusIds[adj["status"]]);
        cmd.Parameters.AddWithValue("@ticketUrl", adj["ticketUrl"]);
        cmd.Parameters.AddWithValue("@department", adj["department"]);
        cmd.Parameters.AddWithValue("@reason", adj["reason"]);
        cmd.Parameters.AddWithValue("@comments", adj["comments"]);
        cmd.Parameters.AddWithValue("@updatedBy", wmsId);
        cmd.Parameters.AddWithValue("@adjustId", adj["id"]);
        ret = Int32.Parse(cmd.ExecuteNonQuery().ToString());
        conn.Close();
    }
    return Int32.Parse(adj["id"].ToString());
}

#endregion

#endregion