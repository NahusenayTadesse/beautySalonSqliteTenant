import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import DataTableActions from './data-table-actions.svelte'; // Assuming a new actions component
import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
import Statuses from '$lib/components/Table/statuses.svelte';
import { formatEthiopianDate } from '$lib/global.svelte';

// NOTE: You must ensure your backend query includes 'name' and 'position'
// from the staff table to display them here!
// e.g., staffName: staff.name, staffPosition: staff.category

export const columns = [
	// 1. Row Index
	{
		accessorKey: 'index',
		header: '#',
		cell: (info) => info.row.index + 1,
		sortable: false
	},

	// 2. Staff Name (Assumes staffName is included in the SELECT)

	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Staff Name',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		// Using DataTableLinks to view staff profile
		cell: ({ row }) => {
			// Use staffId for the link, but ensure staffName is selected in the query
			return renderComponent(DataTableLinks, {
				id: row.original.id,
				name: row.original.name || 'N/A', // Fallback for safety
				link: '/dashboard/salary/single'
			});
		}
	},

	// 3. Position (Assumes staffPosition is included in the SELECT)
	{
		accessorKey: 'department',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Position',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true
	},

	// --- Payroll Specific Fields ---

	// 4. Pay Period
	{
		accessorKey: 'payPeriod',
		header: 'Pay Period',
		// Show 'N/A' if the payroll entry is null
		cell: ({ row }) =>
			row.original.payStart || row.original.payEnd
				? formatEthiopianDate(new Date(row.original.payStart)) +
					' - ' +
					formatEthiopianDate(new Date(row.original.payEnd))
				: 'Not Paid Yet',
		sortable: false // Usually not sortable
	},

	// 5. Basic Salary
	{
		accessorKey: 'basicSalary',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Basic Salary',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => {
			const amount = info.getValue();
			return `ETB ` + amount;
		}
	},

	// 6. Deductions
	{
		accessorKey: 'deductions',
		header: 'Deductions',
		cell: (info) => {
			const amount = info.getValue();
			return amount ? 'ETB ' + amount : 'UNPROCEED';
		}
	},

	{
		accessorKey: 'commision',
		header: 'Commission',
		cell: ({ row }) => {
			return (
				'ETB ' + Number(row.original.commissionProduct) + Number(row.original.commissionService)
			);
		}
	},

	// 7. Net Amount
	{
		accessorKey: 'totalPay',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Net Pay',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => {
			const amount = info.getValue();
			return amount ? 'ETB ' + amount : 'UNPROCESSED';
		}
	},
	{
		accessorKey: 'account',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Bank Account',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => info.getValue() || 'No Account Found' // Default to UNPROCESSED if payroll entry is missing
	},

	{
		accessorKey: 'bank',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Bank',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => info.getValue() || 'UNPROCESSED' // Default to UNPROCESSED if payroll entry is missing
	},

	// 8. Payment Status

	{
		accessorKey: 'status',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Status',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,

		cell: (info) => {
			const status = info.getValue() ? info.getValue() : 'unpaid';
			return renderComponent(Statuses, {
				status: status
			});
		}
	},

	{
		accessorKey: 'paymentMethodName',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Bank',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => info.getValue() || 'UNPROCESSED' // Default to UNPROCESSED if payroll entry is missing
	},

	// 9. Payment Date
	{
		accessorKey: 'paymentDate',
		header: 'Payment Date',
		cell: (info) => (info.getValue() ? formatEthiopianDate(new Date(info.getValue())) : 'N/A'),
		sortable: true
	},

	{
		accessorKey: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			// Check if a payroll entry exists (by checking 'id')

			return renderComponent(DataTableActions, {
				id: row.original.id,
				name: row.original.name
				// You might need more props here
			});
		}
	}
];
