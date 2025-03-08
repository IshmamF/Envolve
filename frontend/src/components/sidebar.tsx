import PostCard from './ui/postcard';

export default function Sidebar({ posts }: { posts: any[] }): JSX.Element {
    return (
      <aside className="w-[420px] lg:w-[480px] xl:w-[520px] bg-white dark:bg-gray-800 overflow-y-auto border-r border-t border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-full text-sm
                dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
                focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Search reports"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </aside>
    );
  };