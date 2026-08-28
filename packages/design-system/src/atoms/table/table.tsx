import { TableBody } from './table_body';
import { TableCell } from './table_cell';
import { TableHeader } from './table_header';
import { TableHeaderCell } from './table_header_cell';
import { TableRow } from './table_row';
import type { ReactNode } from 'react';

export { TableBody, TableCell, TableHeader, TableHeaderCell, TableRow };

export interface TableProps {
	children: ReactNode;
}

/**
 * A semantic wrapper around the native HTML `<table>` element.
 * Applies the base `table` CSS class and acts as the root container
 * for all table-related atoms (`TableHeader`, `TableBody`, `TableRow`, etc.),
 * also exposed as static members (`Table.Header`, `Table.Row`, …).
 *
 * @example
 * <Table>
 *   <Table.Header>...</Table.Header>
 *   <Table.Body>...</Table.Body>
 * </Table>
 */
const Table = (props: TableProps) => {
	const { children } = props;

	return <table className="table">{children}</table>;
};

Table.Header = TableHeader;
Table.HeaderCell = TableHeaderCell;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Body = TableBody;

export default Table;
