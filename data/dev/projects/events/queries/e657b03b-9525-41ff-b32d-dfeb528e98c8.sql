SELECT person.name, ereignis.bezeichnung, ereignis.beginn_jahr, ereignis.ende_jahr
FROM person
	JOIN ereignis
WHERE person.geb_jahr <= ereignis.beginn_jahr
	AND person.tod_jahr >= ereignis.ende_jahr
	AND ereignis.ereignis_id = :ereignis_id