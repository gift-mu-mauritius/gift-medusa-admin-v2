import { Container, Heading, Table, Badge } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

import { Link } from "react-router-dom"
import { SubscriptionData, SubscriptionStatus } from "../types"
import { sdk } from "../../../lib/client"

const listSubscriptionByQuery = async (query: URLSearchParams) => {
  const res = await sdk.admin.subscription.retrieveByQuery(query)
  return res
}

export const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const pageLimit = 20
  const [count, setCount] = useState(0)
  const pagesCount = useMemo(() => {
    return count / pageLimit
  }, [count])
  const canNextPage = useMemo(
    () => currentPage < pagesCount - 1,
    [currentPage, pagesCount]
  )
  const canPreviousPage = useMemo(() => currentPage > 0, [currentPage])

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  useEffect(() => {
    const query = new URLSearchParams({
      limit: `${pageLimit}`,
      offset: `${pageLimit * currentPage}`,
    })

    listSubscriptionByQuery(query).then((res) => setSubscriptions(res))
  }, [currentPage])

  const getBadgeColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.CANCELED:
        return "orange"
      case SubscriptionStatus.FAILED:
        return "red"
      case SubscriptionStatus.EXPIRED:
        return "grey"
      default:
        return "green"
    }
  }

  const getStatusTitle = (status: SubscriptionStatus) => {
    return status.charAt(0).toUpperCase() + status.substring(1)
  }

  return (
    <Container>
      <Heading level="h1">Subscriptions</Heading>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            <Table.HeaderCell>Main Order</Table.HeaderCell>
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell>Subscription Date</Table.HeaderCell>
            <Table.HeaderCell>Expiry Date</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {subscriptions.map((subscription) => (
            <Table.Row key={subscription.id}>
              <Table.Cell>
                <Link to={`/settings/subscription/${subscription.id}`}>
                  {subscription.id}
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Link to={`/orders/${subscription.metadata?.main_order_id}`}>
                  View Order
                </Link>
              </Table.Cell>
              <Table.Cell>
                {subscription.customer && (
                  <Link to={`/customers/${subscription.customer.id}`}>
                    {subscription.customer.email}
                  </Link>
                )}
              </Table.Cell>
              <Table.Cell>
                {new Date(subscription.subscription_date).toDateString()}
              </Table.Cell>
              <Table.Cell>
                {new Date(subscription.expiration_date).toDateString()}
              </Table.Cell>
              <Table.Cell>
                <Badge color={getBadgeColor(subscription.status)}>
                  {getStatusTitle(subscription.status)}
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Table.Pagination
        count={count}
        pageSize={pageLimit}
        pageIndex={currentPage}
        pageCount={pagesCount}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </Container>
  )
}
