'use client';

import { components } from '@/utils/data';
import { Checkbox } from '@backstage/ui';
import { motion } from 'motion/react';
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';
import { screenSizes } from '@/utils/data';
import { usePlayground } from '@/utils/playground-context';

export const Playground = () => {
  const pathname = usePathname();
  const isPlayground = pathname.includes('/playground');
  const {
    selectedScreenSizes,
    setSelectedScreenSizes,
    selectedComponents,
    setSelectedComponents,
  } = usePlayground();

  const handleComponentCheckboxChange = (slug: string) => {
    if (selectedComponents.find(item => item === slug)) {
      const res = selectedComponents.filter(item => item !== slug);
      setSelectedComponents(res);
    } else {
      setSelectedComponents([...selectedComponents, slug]);
    }
  };

  const handleCheckboxChange = (slug: string) => {
    if (selectedScreenSizes.find(item => item === slug)) {
      const res = selectedScreenSizes.filter(item => item !== slug);
      setSelectedScreenSizes(res);
    } else {
      setSelectedScreenSizes([...selectedScreenSizes, slug]);
    }
  };

  return (
    <motion.div
      className={styles.section}
      animate={{
        opacity: isPlayground ? 1 : 0,
        x: isPlayground ? 0 : 20,
        visibility: isPlayground ? 'visible' : 'hidden',
      }}
      initial={{
        opacity: isPlayground ? 1 : 0,
        x: isPlayground ? 0 : 20,
        visibility: isPlayground ? 'visible' : 'hidden',
      }}
      transition={{ duration: 0.2 }}
      style={{ position: 'absolute' }}
    >
      <div className={styles.sectionTitle}>Components</div>
      {components.map(({ slug, title }) => (
        <div className={styles.line} key={slug}>
          <div className={styles.lineTitle}>{title}</div>
          <Checkbox
            checked={selectedComponents.includes(slug)}
            onChange={() => handleComponentCheckboxChange(slug)}
          />
        </div>
      ))}
      <div className={styles.sectionTitle}> Screen sizes</div>
      {screenSizes.map(({ slug, title }) => (
        <div className={styles.line} key={slug}>
          <div className={styles.lineTitle}>{title}</div>
          <Checkbox
            checked={selectedScreenSizes.includes(slug)}
            onChange={() => handleCheckboxChange(slug)}
          />
        </div>
      ))}
    </motion.div>
  );
};
