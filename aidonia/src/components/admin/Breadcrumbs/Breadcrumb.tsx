import Link from "next/link";

interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[26px] font-bold leading-[30px] text-slate-900">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium text-slate-600 hover:text-blue-600 transition-colors" href="/admin">
              Dashboard /
            </Link>
          </li>
          <li className="font-semibold text-blue-600">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
