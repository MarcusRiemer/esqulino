<table class="table table-striped">
	<!--Header with every column name in the table-->
	<thead>
		<tr>
			<th *ngFor="let column of table.columns">
				{{ column.name }}
			</th>
		</tr>
	</thead>
	<!--Table body, with every entry-->
	<tbody>
	<!--expected 2d array with tabledata[row][column]-->
		<tr *ngFor="let row of tableData">
			<td *ngFor="let column of table.columns">
				{{ row[column.index] }}
			</td>
		</tr>
	</tbody>
</table>