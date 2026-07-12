interface TagListProps {
  tags: string[];
  hash?: boolean;
}

const TagList = ({ tags, hash = false }: TagListProps) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <span key={tag} className="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] font-mono uppercase border border-stone-200 rounded-sm">
        {hash ? '#' : ''}{tag}
      </span>
    ))}
  </div>
);

export default TagList;
