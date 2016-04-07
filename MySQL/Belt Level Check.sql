SET @startDay = '2016-03-20 00:00:00';
SET @endDay = '2016-04-02 23:59:59';
SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 2.0
    OR (beltlevel BETWEEN 2 AND 2.25
    AND count = 2)
    OR (beltlevel BETWEEN 2 AND 2.50
    AND count = 3)
    OR (beltlevel BETWEEN 2 AND 2.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 3.0
    OR (beltlevel BETWEEN 3 AND 3.25
    AND count = 2)
    OR (beltlevel BETWEEN 3 AND 3.50
    AND count = 3)
    OR (beltlevel BETWEEN 3 AND 3.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 4.0
    OR (beltlevel BETWEEN 4 AND 4.25
    AND count = 2)
    OR (beltlevel BETWEEN 4 AND 4.50
    AND count = 3)
    OR (beltlevel BETWEEN 4 AND 4.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 5.0
    OR (beltlevel BETWEEN 5 AND 5.25
    AND count = 2)
    OR (beltlevel BETWEEN 5 AND 5.50
    AND count = 3)
    OR (beltlevel BETWEEN 5 AND 5.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 6.0
    OR (beltlevel BETWEEN 6 AND 6.25
    AND count = 2)
    OR (beltlevel BETWEEN 6 AND 6.50
    AND count = 3)
    OR (beltlevel BETWEEN 6 AND 6.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 7.0
    OR (beltlevel BETWEEN 7 AND 7.25
    AND count = 2)
    OR (beltlevel BETWEEN 7 AND 7.50
    AND count = 3)
    OR (beltlevel BETWEEN 7 AND 7.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 8.0
    OR (beltlevel BETWEEN 8 AND 8.25
    AND count = 2)
    OR (beltlevel BETWEEN 8 AND 8.50
    AND count = 3)
    OR (beltlevel BETWEEN 8 AND 8.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 9.0
    OR (beltlevel BETWEEN 9 AND 9.25
    AND count = 2)
    OR (beltlevel BETWEEN 9 AND 9.50
    AND count = 3)
    OR (beltlevel BETWEEN 9 AND 9.75
    AND count = 4) 
UNION ALL SELECT 
    COUNT(*) AS count,
    CONCAT(k.lastName, ', ', k.firstName) AS fullName,
    k.shift,
    k.func,
    b.beltlevel
FROM
    highfivebeltlevels b
        JOIN
    wmsusers w ON w.locationId = b.locationId
        AND w.wmsid = b.associateWmsId
        JOIN
    hrformdata f ON f.locationId = b.locationId
        AND f.associateWmsId = b.associateWmsId
        JOIN
    kronosusers k ON w.kronosId = k.kronosId
WHERE
    f.addedTimestamp BETWEEN @startDay AND @endDay
GROUP BY f.associatewmsid
HAVING beltLevel = 10.0
    OR (beltlevel BETWEEN 10 AND 10.25
    AND count = 2)
    OR (beltlevel BETWEEN 10 AND 10.50
    AND count = 3)
    OR (beltlevel BETWEEN 10 AND 10.75
    AND count = 4);