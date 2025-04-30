// /client/src/components/GTGVaultTagManager.tsx

import React, { useState, useEffect } from "react";
import supabase from "@/services/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface TagManagerProps {
  vehicleId: string;
}

const GTGVaultTagManager: React.FC<TagManagerProps> = ({ vehicleId }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from("vehicle_tags")
        .select("tag")
        .eq("vehicle_id", vehicleId);

      if (!error && data) {
        setTags(data.map((t) => t.tag));
      }
    };
    fetchTags();
  }, [vehicleId]);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const { error } = await supabase
      .from("vehicle_tags")
      .insert({ vehicle_id: vehicleId, tag: newTag.trim() });
    if (!error) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleDeleteTag = async (tag: string) => {
    const { error } = await supabase
      .from("vehicle_tags")
      .delete()
      .eq("vehicle_id", vehicleId)
      .eq("tag", tag);
    if (!error) {
      setTags(tags.filter((t) => t !== tag));
    }
  };

  return (
    <div className="space-y-4 bg-zinc-900 p-4 border border-zinc-800 rounded">
      <h3 className="text-blue-400 text-lg font-orbitron mb-2">Tag Manager</h3>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Enter new tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="bg-zinc-800 border-zinc-700"
        />
        <Button onClick={handleAddTag} className="bg-green-500 text-black hover:bg-green-400">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} className="bg-zinc-700 hover:bg-zinc-600 group relative">
            {tag}
            <Trash2
              className="h-3 w-3 ml-2 cursor-pointer text-red-400 hover:text-red-300"
              onClick={() => handleDeleteTag(tag)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default GTGVaultTagManager;