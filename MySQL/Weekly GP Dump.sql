SET @dayOffset = 1;
SET @locationId = 1;
SET @weekOne_Start = CAST(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 28 + @dayOffset day), '%Y-%m-%d') AS datetime);
SET @weekOne_End = CAST(CONCAT(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 22 + @dayOffset day), '%Y-%m-%d'), 'T23:59:59') AS datetime);

SET @weekTwo_Start = CAST(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 21 + @dayOffset day), '%Y-%m-%d') AS datetime);
SET @weekTwo_End = CAST(CONCAT(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 15 + @dayOffset day), '%Y-%m-%d'), 'T23:59:59') AS datetime);

SET @weekThree_Start = CAST(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 14 + @dayOffset day), '%Y-%m-%d') AS datetime);
SET @weekThree_End = CAST(CONCAT(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 8 + @dayOffset day), '%Y-%m-%d'), 'T23:59:59') AS datetime);

SET @weekFour_Start = CAST(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 7 + @dayOffset day), '%Y-%m-%d') AS datetime);
SET @weekFour_End = CAST(CONCAT(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 + @dayOffset day), '%Y-%m-%d'), 'T23:59:59') AS datetime);

INSERT INTO gp_weekly_dump(kronosId, wmsId, fullName, managerName, shift, homeDept, hireDate, type, operation, flex, lc, weekArray, unitsArray, hoursArray, uphArray, errorsArray, reviewWeekDate, locationId)
SELECT 
    s.kronosId,
    s.wmsId,
    s.fullName,
    s.managerName,
    s.shift,
    s.assocHomeDept,
    IF(s.type = 'IntelliSource',
        s.hireDate,
        s.seniorityDate) AS hireDate,
    s.type,
    s.operation,
    IF(s.assocHomeDept != s.funcHomeDept,
        1,
        0) AS flex,
    IF(LEFT(IF(s.type = 'IntelliSource',
                s.hireDate,
                s.seniorityDate),
            10) >= CAST(DATE_SUB(NOW(),
                INTERVAL 21 + @dayOffset DAY)
            AS DATE),
        1,
        0) AS lc,
    GROUP_CONCAT(s.WEEKNumber) AS weekArray,
    GROUP_CONCAT(s.units) AS unitsArray,
    GROUP_CONCAT(s.hours) AS hoursArray,
    GROUP_CONCAT(s.uph) AS uphArray,
    GROUP_CONCAT(CONCAT_WS(';', q.errors))  AS errorsArray,
    CAST(DATE_SUB(NOW(),
            INTERVAL 7 + @dayOffset DAY)
        AS DATE) AS reviewWeekDate,
    s.locationId
FROM
    (SELECT 
        k.kronosId,
            d.wmsId,
            k.fullName,
            k.managerName,
            k.shift,
            k.func AS assocHomeDept,
            k.hireDate,
            k.seniorityDate,
            k.type,
            IF(d.date BETWEEN @weekOne_Start AND @weekOne_End, @weekOne_Start, IF(d.date BETWEEN @weekTwo_Start AND @weekTwo_End, @weekTwo_Start, IF(d.date BETWEEN @weekThree_Start AND @weekThree_End, @weekThree_Start, IF(d.date BETWEEN @weekFour_Start AND @weekFour_End, @weekFour_Start, NULL)))) AS WEEKNumber,
            d.operation,
            d.func,
            g.homeDept AS funcHomeDept,
            SUM(d.units) AS units,
            SUM(onstd) AS hours,
            ROUND(SUM(d.units) / SUM(onstd), 2) AS UPH,
            d.locationId
    FROM
        gp_daily_dump d
    JOIN kronosroster k ON d.wmsId = k.wmsId
        AND d.locationId = k.locationId
    JOIN uphgoals g ON d.func = g.func
        AND d.locationId = g.locationId
    WHERE
        d.locationID = @locationId
            AND d.onstd > 0
            AND d.date BETWEEN @weekOne_Start AND @weekFour_End
    GROUP BY d.wmsid , d.operation , WEEKNumber
    ORDER BY WEEKNumber) s
		LEFT JOIN
			(SELECT 
				COALESCE(COUNT(track.trackid), 0) AS errors,
				track.empresponsible AS wmsId,
				IFNULL(packtype, d.kronosalias) AS func,
				IF(DATE(track.datecreated) BETWEEN @weekOne_Start AND @weekOne_End,
					@weekOne_Start,
					IF(DATE(track.datecreated) BETWEEN @weekTwo_Start AND @weekTwo_End,
						@weekTwo_Start,
						IF(DATE(track.datecreated) BETWEEN @weekThree_Start AND @weekThree_End,
							@weekThree_Start,
							IF(DATE(track.datecreated) BETWEEN @weekFour_Start AND @weekFour_End,
								@weekFour_Start,
								NULL)))) AS WEEKNumber,
				track.locationId as locationId
			FROM
				(SELECT 
					t.*
				FROM
					icqatrack t
				WHERE
					t.isException = 1
						AND empresponsible IS NOT NULL
						AND locationid = @locationId) track
					LEFT JOIN
				(SELECT 
					p.trackid,
						CAST(CASE p.packarea
								WHEN 'Singles' THEN 'PACKS'
								WHEN 'Putwall' THEN 'PACKW'
								WHEN 'Non-Con' THEN 'PACKN'
								ELSE NULL
							END
							AS CHAR) AS PackType
				FROM
					icqaaudit_pack p) pack ON pack.trackid = track.trackid
					INNER JOIN
				departments d ON d.departmentid = track.departmentid
			WHERE
				track.empresponsible IS NOT NULL
                AND DATE(track.datecreated) BETWEEN @weekOne_Start AND @weekFour_End
			GROUP BY track.empresponsible , func, WEEKNumber, track.locationId
			HAVING WEEKNumber IS NOT NULL AND func IS NOT NULL) q ON q.wmsid = s.wmsId
        AND q.WEEKNumber = s.WEEKNumber
        AND s.func = q.func
        AND q.locationId = s.locationId
GROUP BY s.wmsid , operation
ORDER BY fullName , s.WEEKNumber