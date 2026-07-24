import { PropertiesPageClient } from "@/components/property/PropertiesPageClient"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default function PropertiesPage({ searchParams }: Props) {
  return <PropertiesPageClient searchParams={searchParams} />
}
