import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import { formatETB } from '$lib/global.svelte';

export const columns = [
	{
		id: 'index',
		header: '#',
		cell: (info) => {
			const rowIndex = info.table.getRowModel().rows.findIndex((row) => row.id === info.row.id);
			return rowIndex + 1;
		},
		enableSorting: false
	},
	{
		accessorKey: 'month',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Month',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return row.original.month;
		}
	},

	{
		accessorKey: 'year',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Year',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return row.original.year;
		}
	},

	{
		id: 2,
		accessorKey: 'netPay',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Paid Amount',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			return formatETB(row.original.paidAmount, true);
		}
	},

	{
		accessorKey: 'basicSalary',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Basic Salary',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return formatETB(row.original.basicSalary);
		}
	},

	{
		accessorKey: 'deductions',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Deductions',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return formatETB(row.original.deductions);
		}
	},

	{
		accessorKey: 'overtime',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Over Time',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return formatETB(row.original.overtime ? row.original.overtime : 0, true);
		}
	},

	{
		accessorKey: 'netPay',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Net Pay',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			return formatETB(row.original.netPay, true);
		}
	},

	{
		accessorKey: 'bank',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Bank',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => info.getValue() || 'Account Not Found'
	},

	{
		accessorKey: 'reciept',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Payment Receipt',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		// Using DataTableLinks to view staff profile
		cell: ({ row }) => {
			// Use staffId for the link, but ensure staffName is selected in the query
			return renderComponent(DataTableLinks, {
				id: row.original.recieptLink,
				name: 'View Receipt Link',
				link: '/dashboard/files',
				target: '_blank'
			});
		}
	}
];
