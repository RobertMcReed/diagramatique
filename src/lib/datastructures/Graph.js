class Node {
  constructor(data) {
    this.Content = data.Content;
    this.name = data.name || data.toString();
    this.id = `${this.name}-${Math.random()}`;
    this.children = [];
  }

  addChildren(...nodes) {
    this.children.push(...nodes.map((node) => node.id || node));
    this.children = Array.from(new Set(this.children));

    return this;
  }

  addChild(node) {
    return this.addChildren(node);
  }
}

class Graph {
  constructor(directed) {
    this.directed = !!directed;
    this.nodes = {};
  }

  createNodes(...nodesData) {
    const nodes = nodesData.map((data => new Node(data)));
    nodes.forEach(node => {
      this.nodes[node.id] = node;
    });

    return nodesData.length > 1 ? nodes : nodes[0];
  }

  createNode(nodeData) {
    return this.createNodes(nodeData);
  }

  getAllNodes() {
    return Object.values(this.nodes);
  }

  getNodes(...nodeIds) {
    const nodes = nodeIds.map(nodeId => this.nodes[nodeId]);

    return nodeIds.length > 1 ? nodes : nodes[0];
  }

  getNode(nodeId, hydrate) {
    const node = this.getNodes(nodeId);

    return ((node && hydrate) ? this.hydrate(node) : node);
  }

  hydrate(node) {
    return {
      ...node,
      children: node.children.map(child => this.getNode(child)),
    };
  }

  linkNodes(parentNode, ...children) {
    ([parentNode, ...children] = [parentNode, ...children]
      .map(node => (node instanceof Node
        ? node
        : this.nodes[node]
      ))
    );

    if (!parentNode || children.filter(a => a).length !== children.length) {
      throw new Error('One or more nodes not found');
    }

    if (!(parentNode && children[0])) {
      throw new Error('At least two nodes required');
    }

    parentNode.addChildren(...children);


    if (!this.directed) {
      children.forEach(child => child.addChildren(parentNode));
    }

    return this;
  }

  linkChild(parentNode, childNode) {
    return this.linkNodes(parentNode, childNode);
  }

  spawnStarterNode(data) {
    const node = new Node(data || { name: 'Graph' });

    node.children = this.getAllNodes();

    return node;
  }
}

export default Graph;
