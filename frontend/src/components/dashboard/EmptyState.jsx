import React from "react";
import { motion } from "framer-motion";

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <img
      src="/empty-state.svg"
      alt="No projects"
      className="w-48 mx-auto mb-6"
    />
    <p className="text-gray-600 text-lg">
      No projects yet. Create your first project to get started!
    </p>
  </motion.div>
);

export default EmptyState;
