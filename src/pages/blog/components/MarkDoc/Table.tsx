import { TextAlign } from 'chart.js'
import React from 'react'

type TableProps = {
  children: React.ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-auto py-4">
      <table className="min-w-full border-collapse">{children}</table>
    </div>
  )
}

type TableHeadProps = {
  children: React.ReactNode
}

export function TableHead({ children }: TableHeadProps) {
  return <thead className="bg-gray-100">{children}</thead>
}

type TableBodyProps = {
  children: React.ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>
}

type TableRowProps = {
  children: React.ReactNode
}

export function TableRow({ children }: TableRowProps) {
  return <tr>{children}</tr>
}

type TableHeaderCellProps = {
  children: React.ReactNode
  align?: string
}

export function TableHeaderCell({ children, align = 'left' }: TableHeaderCellProps) {
  return (
    <th className="px-6 py-3 text-left font-medium text-gray-700" style={{ textAlign: align as TextAlign }}>
      {children}
    </th>
  )
}

type TableCellProps = {
  children: React.ReactNode
  align?: string
}

export function TableCell({ children, align = 'left' }: TableCellProps & { align?: 'left' | 'center' | 'right' | 'justify' }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-gray-200" style={{ textAlign: align }}>
      {children}
    </td>
  )
}
