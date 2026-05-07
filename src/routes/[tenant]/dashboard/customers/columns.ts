import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import Copy from '$lib/Copy.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
import { formatEthiopianDate } from '$lib/global.svelte';

export const columns = [
	{
		accessorKey: 'index',
		header: '#',
		cell: (info) => info.row.index + 1,
		sortable: false
	},

	{
		accessorKey: 'customerName',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Name',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableLinks, {
				id: row.original.id,
				name: row.original.customerName,
				link: '/dashboard/customers'
			});
		}
	},
	{
		accessorKey: 'phone',
		header: 'Phone',
		sortable: true,
		cell: ({ row }) => renderComponent(Copy, { data: row.original.phone })
	},

	{
		accessorKey: 'createdBy',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Added By',
				onclick: column.getToggleSortingHandler()
			}),

		sortable: true,
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableLinks, {
				id: row.original.createdById,
				name: row.original.createdBy,
				link: '/dashboard/users'
			});
		}
	},

	{
		accessorKey: 'createdAt',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Booked At',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => {
			return formatEthiopianDate(new Date(info.getValue()));
		}
	},
	{
		accessorKey: 'daysSinceJoined',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Days Since Added',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: (info) => {
			const n = info.getValue(); // number of days
			return `${n} ${n === 1 ? 'day' : 'days'}`;
		}
	},
	{
		accessorKey: 'salesCount',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Sales Counts',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,

		cell: (info) => {
			const n = Number(info.getValue()); // number of days
			return 'ETB ' + n;
		}
	},
	{
		accessorKey: 'appointmentCount',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Appointments Counts',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,

		cell: (info) => {
			const n = info.getValue(); // number of days
			return `${n} ${n === 1 ? 'appointment' : 'appointments'}`;
		}
	},

	{
		accessorKey: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, {
				id: row.original.extraSettings,
				phone: row.original.phone,
				createdBy: row.original.createdBy,
				createdById: row.original.bookedById,
				customerName: row.original.customerName,
				date: row.original.date
			});
		}
	}
];
