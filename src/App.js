import React, { useState, useEffect } from "react";
import axios from "axios";

const TreeNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div onClick={handleToggle} style={{ cursor: "pointer" }}>
        {isOpen ? "-" : "+"} {node.name}
      </div>
      {isOpen && node.children && (
        <div style={{ marginLeft: 20 }}>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ data }) => {
  return (
    <div>
      {data.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};

const ReactTask = () => {
  const [treeData, setTreeData] = useState([]);

  // Fetch tree data from the given API endoint
  useEffect(() => {
    axios
      .get("http://49.249.110.2:8050/api/MenuMasters/GetMenuMasterList/173", {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      })
      .then((res) => {
        console.log("API Response:", res.data.data); // Check the response data
        if (Array.isArray(res.data.data)) {
          const formattedData = formatData(res.data.data);
          console.log("Formatted Data:", formattedData); // Check the formatted data
          setTreeData(formattedData);
        } else {
          console.error(
            "Invalid data format. Expected an array:",
            res.data.data
          );
        }
      })
      .catch((err) => {
        console.error("Error fetching tree data:", err);
      });
  }, []);

  const formatData = (data) => {
    const map = new Map();
    const result = [];

    // Separate headers and items
    const headers = data.filter((item) => !item.refMenuId);
    const items = data.filter((item) => item.refMenuId);

    // Create a map of the items based on their id
    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    // Add children to the items based on their refMenuId
    items.forEach((item) => {
      if (map.has(item.refMenuId)) {
        map.get(item.refMenuId).children.push(map.get(item.id));
      }
    });

    // Create the final tree data based on the headers and their children
    headers.forEach((header) => {
      const headerNode = {
        id: header.id,
        name: header.name,
        children: [],
      };

      items.forEach((item) => {
        if (item.refMenuId === header.id) {
          headerNode.children.push(map.get(item.id));
        }
      });

      result.push(headerNode);
    });

    return result;
  };

  return (
    <div>
      <h2>Tree View</h2>
      <TreeView data={treeData} />
    </div>
  );
};

export default ReactTask;
